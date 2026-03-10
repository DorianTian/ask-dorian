# Ask Dorian — 认证设计方案

> **定位**: 系统设计级文档，覆盖认证架构、Token 策略、OAuth 集成、安全防护、跨端策略
> **版本**: v1.0 — 2026-03-10
> **状态**: 已确认

---

## 目录

- [一、核心决策](#一核心决策)
- [二、认证架构总览](#二认证架构总览)
- [三、注册与登录流程](#三注册与登录流程)
- [四、Token 生命周期管理](#四token-生命周期管理)
- [五、Auth Guard 中间件与安全防护](#五auth-guard-中间件与安全防护)
- [六、数据库 Schema 变更](#六数据库-schema-变更)
- [七、Auth API 路由与接口定义](#七auth-api-路由与接口定义)
- [八、前端集成](#八前端集成)
- [九、跨端策略与 Phase 扩展路线](#九跨端策略与-phase-扩展路线)

---

## 一、核心决策

| 决策 | 选择 | 说明 |
|------|------|------|
| 登录方式 | 邮箱密码 + Google OAuth | MVP 阶段，Phase 3 加微信/Apple |
| Token 存储 | 双 Token 走 JSON Body (方案 C) | 跨端统一，无 Cookie 依赖，CSRF 免疫 |
| Access Token | JWT HS256, 15min 有效期 | 短时效，无状态验证 |
| Refresh Token | 随机 64 字节 hex, 7d 有效期 | DB 存 SHA-256 hash，有状态，支持 Rotation |
| 密码 | bcrypt, cost=12 | |
| OAuth | Google OAuth 2.0 Authorization Code Flow + PKCE | |

### 方案 C 选择理由

- **跨端刚需** — roadmap 有 Tauri (P2) + Expo (P3)，Cookie 方案需大改，Bearer token 全平台通用
- **XSS 风险可控** — Next.js 默认转义 + CSP + Refresh Token Rotation + 设备绑定
- **实现最简** — 不涉及 Cookie 配置、SameSite、CORS credentials
- **CSRF 免疫** — 不使用 Cookie，CSRF 攻击不存在
- **行业实践** — Sunsama、Linear、Notion 桌面端/移动端均使用 Bearer token

### 安全加固措施

- **Refresh Token Rotation**: 每次 refresh 旧 token 立即作废
- **设备绑定**: refreshToken 与 device_id 绑定，异设备使用直接拒绝
- **Reuse Detection**: 同一 refreshToken 被多次使用 → 视为泄露 → revoke 该设备所有 session

---

## 二、认证架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Web / Tauri / RN)              │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Login Form  │  │ Google OAuth │  │ Token Manager      │ │
│  │ email+pwd   │  │ "一键登录"   │  │ (Zustand Store)    │ │
│  └──────┬──────┘  └──────┬───────┘  │                    │ │
│         │                │          │ accessToken: 内存   │ │
│         │                │          │ refreshToken: local │ │
│         │                │          │ user: 内存          │ │
│         └──────┬─────────┘          └─────────┬──────────┘ │
│                │                              │            │
└────────────────┼──────────────────────────────┼────────────┘
                 │ POST /auth/login             │ Authorization:
                 │ POST /auth/google            │ Bearer <access>
                 ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Koa.js)                     │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Auth     │  │ Auth Guard   │  │ Token Service         │ │
│  │ Routes   │  │ Middleware   │  │                       │ │
│  │          │  │              │  │ sign/verify JWT       │ │
│  │ register │  │ verify JWT   │  │ generate refresh      │ │
│  │ login    │  │ inject user  │  │ rotate on refresh     │ │
│  │ google   │  │ rate limit   │  │ revoke on logout      │ │
│  │ refresh  │  │              │  │ device binding check  │ │
│  │ logout   │  │              │  │ reuse detection       │ │
│  └──────────┘  └──────────────┘  └───────────────────────┘ │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (users + sessions + devices)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、注册与登录流程

### 3.1 邮箱注册

```
POST /api/v1/auth/register
```

流程：
1. zod 校验 (email 格式, password >= 8 字符, name <= 100)
2. 查重：`SELECT id FROM users WHERE email = $1` → 409 EMAIL_EXISTS
3. `bcrypt.hash(password, cost=12)`
4. `INSERT INTO users` + `INSERT INTO user_settings` (默认设置)
5. `INSERT INTO devices` (注册设备)
6. 生成 accessToken (JWT 15min) + refreshToken (随机 64 字节)
7. `INSERT INTO sessions` (refresh_token_hash, device_id, expires_at)
8. 返回 201 `{accessToken, refreshToken, user}`

**密码规则** (MVP 简洁):
- 最短 8 位
- 不限制大小写/特殊字符（现代安全共识：长度 > 复杂度）
- 前端用 zxcvbn 做弱密码提示（不阻塞）

### 3.2 邮箱登录

```
POST /api/v1/auth/login
```

流程：
1. zod 校验
2. `SELECT * FROM users WHERE email = $1` → 不存在返回 401 INVALID_CREDENTIALS
3. 检查 `password_hash !== 'OAUTH_ONLY'` → 否则 401 INVALID_CREDENTIALS
4. `bcrypt.compare(password, user.password_hash)` → 失败返回 401 INVALID_CREDENTIALS
5. **不区分"用户不存在"和"密码错误"**，统一 INVALID_CREDENTIALS 防枚举
6. UPSERT devices (根据 fingerprint 去重)
7. 生成 accessToken + refreshToken → INSERT sessions
8. 返回 200 `{accessToken, refreshToken, user}`

### 3.3 Google OAuth

```
POST /api/v1/auth/google
```

前端用 `@react-oauth/google` 走 Authorization Code Flow + PKCE。

流程：
1. 前端弹出 Google 授权窗口，生成 code_verifier + code_challenge
2. Google 返回 authorization_code
3. 前端发送 `{code, codeVerifier, redirectUri, deviceInfo}` 给后端
4. 后端用 code 换 tokens (Google OAuth2 API)
5. 验证 id_token (google-auth-library)，提取 `{sub, email, name, picture}`
6. `SELECT * FROM users WHERE google_sub = $sub OR email = $email`
   - 新用户 → INSERT users (password_hash = 'OAUTH_ONLY') + user_settings
   - 已有用户但未绑定 Google → UPDATE users SET google_sub = $sub
7. UPSERT devices → 生成 tokens → INSERT sessions
8. 返回 200 `{accessToken, refreshToken, user, isNewUser}`

**关键细节**：
- `password_hash = 'OAUTH_ONLY'` 表示 OAuth-only 用户（非 NULL，简化逻辑）
- 邮箱匹配 + google_sub 匹配双通道：先邮箱注册后 Google 登录自动绑定
- `google_sub` 是 Google 用户唯一 ID，不依赖邮箱做唯一标识

---

## 四、Token 生命周期管理

### 4.1 Token 规格

| Token | 格式 | 有效期 | 存储位置 | 内容 |
|-------|------|--------|----------|------|
| Access Token | JWT (HS256) | 15 min | 前端内存 (Zustand) | `{sub, role, did, iat, exp}` |
| Refresh Token | 随机 64 字节 hex | 7 天 | 前端 localStorage | 不含业务信息 |

**HS256 选择理由**: 单体后端签发方=验证方，不需要公钥分发，性能 ~10x faster。Phase 2+ 拆微服务再迁 RS256。

### 4.2 JWT Payload

```json
{
  "sub": "uuid-user-id",
  "role": "free",
  "did": "uuid-device-id",
  "iat": 1741564800,
  "exp": 1741565700
}
```

极简设计。不放 email/name 等可变数据——避免用户改名但旧 token 不一致。

### 4.3 Refresh Token Rotation

每次 refresh 时：
1. 验证 `SHA256(refreshToken)` 匹配 sessions 表中的 `refresh_token_hash`
2. 校验 `device_id` 匹配
3. 生成新 refreshToken
4. 更新 sessions：`previous_token_hash = refresh_token_hash`, `refresh_token_hash = SHA256(newToken)`
5. 签发新 accessToken
6. 返回新的 accessToken + refreshToken，旧 refreshToken 立即作废

### 4.4 Reuse Detection

sessions 表 `previous_token_hash` 列实现：

```sql
UPDATE sessions SET
  previous_token_hash = refresh_token_hash,
  refresh_token_hash = $newHash,
  last_active_at = NOW()
WHERE id = $sessionId;
```

收到 refresh 请求时：
- `refresh_token_hash` 匹配 → 正常 rotation
- `previous_token_hash` 匹配 → **token 泄露**，立刻 revoke 该 session
- 都不匹配 → 401 SESSION_EXPIRED

---

## 五、Auth Guard 中间件与安全防护

### 5.1 Auth Guard

```typescript
// middleware/authGuard.ts (伪代码)
async function authGuard(ctx, next) {
  const header = ctx.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('MISSING_TOKEN', 401);
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    ctx.state.userId = payload.sub;
    ctx.state.role = payload.role;
    ctx.state.deviceId = payload.did;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthError('TOKEN_EXPIRED', 401);
    }
    throw new AuthError('INVALID_TOKEN', 401);
  }
  await next();
}
```

**路由分组**:
- 公开路由: register, login, google, refresh
- 保护路由: logout, logout-all, 所有 /api/v1/* 业务路由

### 5.2 Rate Limiting

| 路由 | 限制 | 窗口 | 说明 |
|------|------|------|------|
| `POST /auth/register` | 5 次 | 10 min / IP | 防批量注册 |
| `POST /auth/login` | 10 次 | 15 min / IP+email | 防暴力破解 |
| `POST /auth/google` | 20 次 | 15 min / IP | OAuth 宽松 |
| `POST /auth/refresh` | 30 次 | 15 min / userId | 正常使用不超 |
| `POST /api/v1/fragments` | 60 次 | 1 min / userId | AI 成本控制 |
| 其他 API | 120 次 | 1 min / userId | 通用防滥用 |

**登录失败锁定**: 同一 email 连续 5 次失败 → 锁定 15 分钟。不返回"还剩几次"。内存 Map 实现 (MVP)。

### 5.3 安全 Headers

```typescript
ctx.set({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});
```

### 5.4 登出与会话管理

- **单设备登出** `POST /auth/logout {refreshToken}`: revoke 当前 session
- **全设备登出** `POST /auth/logout-all` [需认证]: revoke 该用户所有 active sessions

### 5.5 Error Code 枚举

| code | status | 场景 |
|------|--------|------|
| `MISSING_TOKEN` | 401 | 请求未携带 Authorization header |
| `INVALID_TOKEN` | 401 | JWT 格式错误或签名不匹配 |
| `TOKEN_EXPIRED` | 401 | JWT 已过期（前端应触发 refresh） |
| `SESSION_EXPIRED` | 401 | Refresh token 过期或已被 revoke |
| `DEVICE_MISMATCH` | 401 | Refresh token 与设备不匹配 |
| `TOKEN_REUSED` | 401 | Refresh token 重放检测触发 |
| `INVALID_CREDENTIALS` | 401 | 邮箱/密码错误（不细分） |
| `EMAIL_EXISTS` | 409 | 注册时邮箱已被使用 |
| `ACCOUNT_LOCKED` | 423 | 登录失败次数超限，临时锁定 |
| `RATE_LIMITED` | 429 | 触发限流 |
| `OAUTH_FAILED` | 502 | Google OAuth 服务端校验失败 |

---

## 六、数据库 Schema 变更

现有 `database-schema.sql` 中 sessions 表需新增一列：

```sql
previous_token_hash  VARCHAR(64),
-- 上一次轮换前的 refresh_token_hash，用于 Reuse Detection
```

其余表（users, sessions, devices）已在 `database-schema.sql` 中完备设计，无需额外改动。

`password_hash` 对 OAuth-only 用户存固定标记 `'OAUTH_ONLY'`（保持 NOT NULL）。

---

## 七、Auth API 路由与接口定义

### 路由总表

```
POST   /api/v1/auth/register        邮箱注册
POST   /api/v1/auth/login           邮箱登录
POST   /api/v1/auth/google          Google OAuth 登录/注册
POST   /api/v1/auth/refresh         刷新 Token (Rotation)
POST   /api/v1/auth/logout          单设备登出
POST   /api/v1/auth/logout-all      全设备登出 [需认证]
```

### 接口类型定义

```typescript
// --- Request Types ---
interface RegisterInput {
  email: string;
  password: string;
  name: string;
  deviceInfo?: DeviceInfo;
}

interface LoginInput {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

interface GoogleAuthInput {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  deviceInfo?: DeviceInfo;
}

interface RefreshInput {
  refreshToken: string;
  deviceId: string;
}

interface LogoutInput {
  refreshToken: string;
}

// --- Response Types ---
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// --- Shared Types ---
interface DeviceInfo {
  deviceName?: string;
  deviceType: string;       // "desktop" | "mobile" | "tablet"
  platform: string;         // "web" | "tauri" | "ios" | "android"
  appVersion?: string;
  osInfo?: string;
  fingerprint?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'free' | 'pro' | 'admin';
  locale: string;
  timezone: string;
  hasPassword: boolean;
  linkedAccounts: {
    google: boolean;
    wechat: boolean;
    apple: boolean;
  };
}
```

---

## 八、前端集成

### 8.1 Auth Store (Zustand)

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  register(data: RegisterInput): Promise<void>;
  login(data: LoginInput): Promise<void>;
  loginWithGoogle(data: GoogleAuthInput): Promise<void>;
  refresh(): Promise<void>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  initialize(): Promise<void>;
}
```

### 8.2 API Interceptor 逻辑

```
发起请求 →
  accessToken 存在 && 剩余 > 2min → 直接请求
  accessToken 存在 && 剩余 ≤ 2min → 先 refresh() 再请求
  accessToken 不存在 && refreshToken 存在 → 先 refresh() 再请求
  都不存在 → 跳转登录页

收到响应 →
  200~299 → 正常返回
  401 TOKEN_EXPIRED → refresh() → 重试原请求（仅 1 次）
  401 其他 → logout() → 跳转登录页
  429 → 显示限流提示
```

**防并发 Refresh**: 多个请求同时 401 时，用 Promise 锁共享同一个 refresh 请求。

### 8.3 页面刷新恢复

```
App 初始化 → localStorage 有 refreshToken?
  No → 跳转登录页
  Yes → POST /auth/refresh
    200 → 拿到新 tokens → 正常使用
    401 → 跳转登录页
```

### 8.4 路由保护

- 公开路由: /login, /register, /auth/callback/google
- 保护路由: /today, /inbox, /weekly, /projects, /review, /settings, ...
- 未认证访问保护路由 → redirect /login?from={current_path}

### 8.5 Google OAuth 前端

使用 `@react-oauth/google`，PKCE 模式。

Google Cloud Console 配置：
- OAuth consent screen: External, 产品名 "Ask Dorian"
- Authorized redirect URIs: `https://askdorian.com/auth/callback/google` + `http://localhost:3000/auth/callback/google`

---

## 九、跨端策略与 Phase 扩展路线

### 9.1 跨端 Token 存储

| 平台 | accessToken | refreshToken |
|------|-------------|--------------|
| Web (Next.js) | Zustand 内存 | localStorage |
| Tauri (Phase 2) | Rust 内存 | tauri-plugin-store (加密) |
| iOS/Android (Phase 3) | 内存 | Keychain / EncryptedSharedPreferences |
| 微信小程序 (Phase 3) | 内存 | wx.setStorageSync (加密) |

所有平台 API 调用方式一致：`Authorization: Bearer <accessToken>`。后端零改动。

### 9.2 Phase 扩展路线

| Phase | 新增能力 | 改动范围 |
|-------|----------|----------|
| MVP | 邮箱密码 + Google OAuth | 本设计全部内容 |
| Phase 2 | Rate limit 迁 Redis + 邮箱验证 + 忘记密码 | 新增 2 路由 + Redis |
| Phase 3 | 微信登录 + Apple Sign In | 新增 2 OAuth 路由，users 表已预留字段 |
| Phase 3 | 2FA (TOTP) | 新增 users.totp_secret + 2 路由 |
| Phase 4 | SSO / Magic Link | 新增路由，架构兼容 |
