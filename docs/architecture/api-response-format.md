# Ask Dorian — 统一接口返回格式规范

> **定位**: 项目级 API 规范，所有后端接口遵循此格式
> **版本**: v1.0 — 2026-03-10
> **状态**: 已确认

---

## 目录

- [一、设计原则](#一设计原则)
- [二、成功响应](#二成功响应)
- [三、错误响应](#三错误响应)
- [四、Error Code 枚举](#四error-code-枚举)
- [五、HTTP Status Code 规范](#五http-status-code-规范)
- [六、字段命名规范](#六字段命名规范)
- [七、TypeScript 类型定义](#七typescript-类型定义)

---

## 一、设计原则

**裸数据模式 (方案 A)**: 成功直接返回业务数据，错误才有固定信封。

- HTTP status code 本身就是状态标识，不再包一层 `code: 0`
- TypeScript 友好：`const task = await api.getTask(id)` 直接得到 Task 类型
- RESTful 正统：Linear、Notion、GitHub API、Stripe 均采用此模式

---

## 二、成功响应

### 单资源

```typescript
// GET /api/v1/tasks/:id
// 200
{
  "id": "uuid",
  "title": "准备 Q2 OKR",
  "status": "todo",
  "priority": "high",
  "createdAt": "2026-03-10T06:30:00Z"
}
```

### 资源列表 (带分页)

```typescript
// GET /api/v1/tasks?status=todo&page=1&pageSize=20
// 200
{
  "items": [
    { "id": "uuid", "title": "...", ... },
    { "id": "uuid", "title": "...", ... }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 87,
    "totalPages": 5
  }
}
```

### 创建资源

```typescript
// POST /api/v1/tasks
// 201
{ "id": "uuid", "title": "准备 Q2 OKR", ... }
```

### 更新资源

```typescript
// PATCH /api/v1/tasks/:id
// 200
{ "id": "uuid", "title": "更新后的标题", ... }
```

### 删除资源 (软删除)

```typescript
// DELETE /api/v1/tasks/:id
// 204 No Content (无 body)
```

### 聚合接口

```typescript
// GET /api/v1/today
// 200
{
  "tasks": [...],
  "events": [...],
  "fragments": [...],
  "stats": { "completedToday": 3, "pendingFragments": 2 }
}
```

---

## 三、错误响应

所有错误（4xx / 5xx）统一格式：

```typescript
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "任务不存在",
    "details": {}              // 可选，仅需要时携带
  }
}
```

### details 使用场景

**场景 1 — 校验失败 (多字段错误):**

```typescript
// POST /api/v1/auth/register  { email: "bad", password: "123" }
// 422
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "输入校验失败",
    "details": {
      "fields": {
        "email": "邮箱格式不正确",
        "password": "密码至少 8 位"
      }
    }
  }
}
```

**场景 2 — 乐观锁冲突:**

```typescript
// PATCH /api/v1/tasks/:id  { version: 3, title: "..." }
// 409
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "数据已被其他设备修改",
    "details": {
      "currentVersion": 4
    }
  }
}
```

---

## 四、Error Code 枚举

```typescript
// shared/constants/error-codes.ts

export const ErrorCode = {
  // === 认证 (401) ===
  MISSING_TOKEN:       'MISSING_TOKEN',
  INVALID_TOKEN:       'INVALID_TOKEN',
  TOKEN_EXPIRED:       'TOKEN_EXPIRED',
  SESSION_EXPIRED:     'SESSION_EXPIRED',
  DEVICE_MISMATCH:     'DEVICE_MISMATCH',
  TOKEN_REUSED:        'TOKEN_REUSED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // === 权限 (403) ===
  FORBIDDEN:           'FORBIDDEN',
  QUOTA_EXCEEDED:      'QUOTA_EXCEEDED',

  // === 资源 (404/409) ===
  RESOURCE_NOT_FOUND:  'RESOURCE_NOT_FOUND',
  EMAIL_EXISTS:        'EMAIL_EXISTS',
  VERSION_CONFLICT:    'VERSION_CONFLICT',

  // === 输入 (422) ===
  VALIDATION_FAILED:   'VALIDATION_FAILED',

  // === 锁定 (423) ===
  ACCOUNT_LOCKED:      'ACCOUNT_LOCKED',

  // === 限流 (429) ===
  RATE_LIMITED:        'RATE_LIMITED',

  // === 服务端 (500/502) ===
  INTERNAL_ERROR:      'INTERNAL_ERROR',
  OAUTH_FAILED:        'OAUTH_FAILED',
  AI_PIPELINE_FAILED:  'AI_PIPELINE_FAILED',
} as const;
```

**命名规则**: `UPPER_SNAKE_CASE`，名词/形容词描述状态，不含 HTTP status code 数字。

---

## 五、HTTP Status Code 规范

| Status | 语义 | 何时用 |
|--------|------|--------|
| 200 | OK | GET / PATCH / 通用成功 |
| 201 | Created | POST 创建资源 |
| 204 | No Content | DELETE 成功 |
| 401 | Unauthorized | 认证失败（token 相关） |
| 403 | Forbidden | 有身份但无权限 / 配额用尽 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 邮箱重复 / 乐观锁版本冲突 |
| 422 | Unprocessable Entity | zod 校验失败 |
| 423 | Locked | 账号锁定 |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 未预期的服务端错误 |
| 502 | Bad Gateway | 外部服务失败（Google OAuth / Claude API） |

**原则**: HTTP status code 够用就用，不发明自定义状态码。

---

## 六、字段命名规范

| 规则 | 示例 |
|------|------|
| **camelCase** | `createdAt`, `pageSize`, `userId` |
| 时间字段统一 **ISO 8601 UTC** | `"2026-03-10T06:30:00Z"` |
| 布尔字段用 `is/has` 前缀 | `isCompleted`, `hasPassword` |
| ID 字段统一 `string` (UUID) | `"550e8400-e29b-41d4-a716-446655440000"` |
| 空值用 `null` 不用 `undefined` | `"avatarUrl": null` |
| 列表字段用复数 | `"items"`, `"tags"`, `"conflicts"` |

---

## 七、TypeScript 类型定义

```typescript
// shared/types/api.ts

/** 分页参数 (请求) */
interface PaginationQuery {
  page?: number;        // 默认 1
  pageSize?: number;    // 默认 20, 最大 100
}

/** 分页信息 (响应) */
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 分页列表响应 */
interface PaginatedList<T> {
  items: T[];
  pagination: Pagination;
}

/** 错误响应 */
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```
