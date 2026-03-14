#!/usr/bin/env bash
# =============================================================================
# Seed script for Ask Dorian system accounts (mock + test)
# Calls backend REST API to create accounts + mock data
# Usage: bash scripts/seed-dorian.sh [BASE_URL]
# =============================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:4000}"
API="${BASE_URL}/api/v1"

# ---------------------------------------------------------------------------
# Account list: mock (primary demo) + test (QA)
# These are system accounts with 100-year tokens (see jwt.ts)
# ---------------------------------------------------------------------------
ACCOUNTS=("mock@askdorian.com" "test@askdorian.com")
PASSWORDS=("mock2024" "test2024")
NAMES=("Mock User" "Test User")

seed_account() {
  local EMAIL="$1"
  local PASSWORD="$2"
  local NAME="$3"

  echo ""
  echo "================================================================"
  echo "==> Seeding account: ${EMAIL}"
  echo "================================================================"

  # -----------------------------------------------------------------------
  # 1. Register / Login
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 1: Register account ---"

  REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${EMAIL}\",
      \"password\": \"${PASSWORD}\",
      \"name\": \"${NAME}\",
      \"deviceInfo\": {
        \"deviceType\": \"desktop\",
        \"platform\": \"web\",
        \"deviceName\": \"Seed Script\",
        \"appVersion\": \"0.1.0\"
      }
    }")

  HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
  BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "201" ]; then
    echo "  Account created successfully"
  elif [ "$HTTP_CODE" = "409" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "  Account may already exist, trying login..."
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API}/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"${EMAIL}\",
        \"password\": \"${PASSWORD}\",
        \"deviceInfo\": {
          \"deviceType\": \"desktop\",
          \"platform\": \"web\",
          \"deviceName\": \"Seed Script\",
          \"appVersion\": \"0.1.0\"
        }
      }")
    HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
    BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" != "200" ]; then
      echo "  ERROR: Login failed (HTTP ${HTTP_CODE})"
      echo "  ${BODY}"
      return 1
    fi
    echo "  Logged in successfully"
  else
    echo "  ERROR: Register failed (HTTP ${HTTP_CODE})"
    echo "  ${BODY}"
    return 1
  fi

  # Extract access token
  ACCESS_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['tokens']['accessToken'])" 2>/dev/null || \
                 echo "$BODY" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$ACCESS_TOKEN" ]; then
    echo "  ERROR: Could not extract access token"
    echo "  Response: ${BODY}"
    return 1
  fi

  echo "  Token obtained"

  AUTH="Authorization: Bearer ${ACCESS_TOKEN}"

  # Helper: POST with auth
  post() {
    local path="$1"
    local data="$2"
    local resp
    resp=$(curl -s -w "\n%{http_code}" -X POST "${API}${path}" \
      -H "Content-Type: application/json" \
      -H "${AUTH}" \
      -d "${data}")
    local code
    code=$(echo "$resp" | tail -1)
    local body
    body=$(echo "$resp" | sed '$d')
    if [ "$code" = "201" ] || [ "$code" = "200" ]; then
      echo "  OK: $(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title','') or d.get('rawContent','')[:50] or 'created')" 2>/dev/null || echo "created")"
    else
      echo "  WARN (${code}): $(echo "$body" | head -c 120)"
    fi
  }

  # -----------------------------------------------------------------------
  # 2. Rituals
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 2: Create rituals ---"

  post "/rituals" '{"title": "10min Mindful Breathing", "isFocus": false}'
  post "/rituals" '{"title": "Cold Shower (Level 3)", "isFocus": false}'
  post "/rituals" '{"title": "Review Product Specs", "isFocus": true}'
  post "/rituals" '{"title": "Journaling (Daily Intentions)", "isFocus": false}'

  # -----------------------------------------------------------------------
  # 3. Tasks
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 3: Create tasks ---"

  TODAY=$(date -u +"%Y-%m-%d")
  TOMORROW=$(date -u -v+1d +"%Y-%m-%d" 2>/dev/null || date -u -d "+1 day" +"%Y-%m-%d")
  IN_2_DAYS=$(date -u -v+2d +"%Y-%m-%d" 2>/dev/null || date -u -d "+2 days" +"%Y-%m-%d")
  IN_3_DAYS=$(date -u -v+3d +"%Y-%m-%d" 2>/dev/null || date -u -d "+3 days" +"%Y-%m-%d")
  IN_4_DAYS=$(date -u -v+4d +"%Y-%m-%d" 2>/dev/null || date -u -d "+4 days" +"%Y-%m-%d")
  IN_5_DAYS=$(date -u -v+5d +"%Y-%m-%d" 2>/dev/null || date -u -d "+5 days" +"%Y-%m-%d")
  YESTERDAY=$(date -u -v-1d +"%Y-%m-%d" 2>/dev/null || date -u -d "-1 day" +"%Y-%m-%d")
  TWO_DAYS_AGO=$(date -u -v-2d +"%Y-%m-%d" 2>/dev/null || date -u -d "-2 days" +"%Y-%m-%d")

  # Scheduled tasks for today
  post "/tasks" "{\"title\": \"Design Sprint Review\", \"priority\": \"high\", \"scheduledDate\": \"${TODAY}\", \"estimatedMinutes\": 90, \"tags\": [\"design\", \"sprint\"]}"
  post "/tasks" "{\"title\": \"Client Review - Alpha Project\", \"priority\": \"urgent\", \"scheduledDate\": \"${TODAY}\", \"estimatedMinutes\": 60, \"tags\": [\"client\", \"review\"]}"
  post "/tasks" "{\"title\": \"Update API Documentation\", \"priority\": \"medium\", \"scheduledDate\": \"${TODAY}\", \"estimatedMinutes\": 45, \"tags\": [\"docs\", \"api\"]}"

  # Future tasks
  post "/tasks" "{\"title\": \"Board Meeting Prep\", \"priority\": \"urgent\", \"dueDate\": \"${TOMORROW}\", \"scheduledDate\": \"${TOMORROW}\", \"estimatedMinutes\": 120, \"tags\": [\"meeting\", \"board\"]}"
  post "/tasks" "{\"title\": \"Q4 Marketing Plan\", \"priority\": \"high\", \"dueDate\": \"${IN_3_DAYS}\", \"scheduledDate\": \"${IN_2_DAYS}\", \"estimatedMinutes\": 180, \"tags\": [\"marketing\", \"q4\"]}"
  post "/tasks" "{\"title\": \"Security Audit\", \"priority\": \"high\", \"dueDate\": \"${IN_5_DAYS}\", \"scheduledDate\": \"${IN_3_DAYS}\", \"estimatedMinutes\": 240, \"tags\": [\"security\", \"audit\"]}"
  post "/tasks" "{\"title\": \"Team Offsite Planning\", \"priority\": \"medium\", \"dueDate\": \"${IN_5_DAYS}\", \"scheduledDate\": \"${IN_4_DAYS}\", \"estimatedMinutes\": 60, \"tags\": [\"team\", \"offsite\"]}"

  # Overdue tasks
  post "/tasks" "{\"title\": \"Finalize Q3 Strategic Roadmap\", \"priority\": \"urgent\", \"dueDate\": \"${TWO_DAYS_AGO}\", \"tags\": [\"strategy\", \"roadmap\"]}"
  post "/tasks" "{\"title\": \"Submit Expense Reports\", \"priority\": \"high\", \"dueDate\": \"${YESTERDAY}\", \"tags\": [\"admin\", \"finance\"]}"

  # -----------------------------------------------------------------------
  # 4. Events (this week)
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 4: Create events ---"

  post "/events" "{\"title\": \"Morning Ritual\", \"type\": \"personal\", \"startTime\": \"${TODAY}T08:00:00.000Z\", \"endTime\": \"${TODAY}T08:30:00.000Z\", \"tags\": [\"wellness\"]}"
  post "/events" "{\"title\": \"Weekly Sync\", \"type\": \"meeting\", \"startTime\": \"${TODAY}T10:00:00.000Z\", \"endTime\": \"${TODAY}T11:00:00.000Z\", \"location\": \"Zoom\", \"tags\": [\"team\", \"sync\"]}"
  post "/events" "{\"title\": \"Mindful Lunch\", \"type\": \"personal\", \"startTime\": \"${TODAY}T12:00:00.000Z\", \"endTime\": \"${TODAY}T12:30:00.000Z\"}"
  post "/events" "{\"title\": \"Client Presentation\", \"type\": \"meeting\", \"startTime\": \"${TODAY}T14:00:00.000Z\", \"endTime\": \"${TODAY}T15:00:00.000Z\", \"location\": \"Conference Room A\", \"tags\": [\"client\"]}"
  post "/events" "{\"title\": \"Deep Work Block\", \"type\": \"focus\", \"startTime\": \"${TOMORROW}T09:00:00.000Z\", \"endTime\": \"${TOMORROW}T11:30:00.000Z\", \"tags\": [\"focus\", \"coding\"]}"
  post "/events" "{\"title\": \"1:1 with Manager\", \"type\": \"meeting\", \"startTime\": \"${TOMORROW}T13:00:00.000Z\", \"endTime\": \"${TOMORROW}T13:30:00.000Z\", \"location\": \"Zoom\", \"tags\": [\"1on1\"]}"
  post "/events" "{\"title\": \"Sprint Planning\", \"type\": \"meeting\", \"startTime\": \"${IN_2_DAYS}T10:00:00.000Z\", \"endTime\": \"${IN_2_DAYS}T11:30:00.000Z\", \"tags\": [\"sprint\", \"planning\"]}"
  post "/events" "{\"title\": \"Outdoor Run\", \"type\": \"personal\", \"startTime\": \"${IN_2_DAYS}T17:00:00.000Z\", \"endTime\": \"${IN_2_DAYS}T18:00:00.000Z\", \"tags\": [\"exercise\"]}"

  # -----------------------------------------------------------------------
  # 5. Fragments (pending, for Stream)
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 5: Create fragments ---"

  post "/fragments" '{"rawContent": "Review Q3 marketing campaign results and prepare summary for stakeholders. Key metrics: CAC down 12%, conversion rate up 8%, overall ROI improved.", "contentType": "text", "inputSource": "inbox"}'
  post "/fragments" '{"rawContent": "Check the new React Server Components architecture — might improve our dashboard loading time by 40%. Article: https://react.dev/blog/2024/rsc-deep-dive", "contentType": "url", "inputSource": "share_sheet", "sourceApp": "Safari"}'
  post "/fragments" '{"rawContent": "Meeting notes from client call: They want to integrate our API with their Salesforce instance by end of Q4. Need to scope the connector work and provide estimate by next Friday.", "contentType": "text", "inputSource": "inbox"}'
  post "/fragments" '{"rawContent": "Interesting paper on vector embeddings for semantic search optimization. Could improve our knowledge base search relevance significantly. arxiv.org/abs/2024.xxxxx", "contentType": "url", "inputSource": "share_sheet", "sourceApp": "Chrome"}'
  post "/fragments" '{"rawContent": "Reminder: Update the deployment pipeline to support canary releases. The current blue-green setup is causing 30s downtime windows during deploys.", "contentType": "text", "inputSource": "quick_capture"}'
  post "/fragments" '{"rawContent": "Book recommendation from team lead: \"Designing Data-Intensive Applications\" by Martin Kleppmann. Essential reading for the data pipeline refactor project.", "contentType": "text", "inputSource": "inbox"}'

  # -----------------------------------------------------------------------
  # 6. Knowledge entries
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 6: Create knowledge entries ---"

  post "/knowledge" '{
    "title": "React Server Components Architecture",
    "content": "RSC allows rendering components on the server, sending serialized component tree to client. Key benefits: reduced bundle size, direct backend access, streaming SSR. Trade-offs: increased server load, new mental model for data fetching. Compatible with Next.js App Router.\n\nKey patterns:\n- Server Components for data fetching\n- Client Components for interactivity\n- Streaming with Suspense boundaries\n- Server Actions for mutations",
    "knowledgeType": "note",
    "summary": "Deep dive into React Server Components — architecture, patterns, and trade-offs",
    "tags": ["react", "architecture", "frontend"]
  }'

  post "/knowledge" '{
    "title": "Vector Embedding Search Optimization",
    "content": "Comparison of embedding models for semantic search:\n\n1. OpenAI text-embedding-3-small (1536d): Best cost/performance ratio\n2. Cohere embed-v3: Best for multilingual\n3. BGE-M3: Best open-source option\n\nHNSW index tuning:\n- m=16, ef_construction=200 for build\n- ef_search=100 for query\n- Cosine similarity for normalized vectors\n\nReranking pipeline: BM25 candidates → vector similarity → Cohere rerank v3 for final ordering.",
    "knowledgeType": "research",
    "summary": "Embedding model comparison and HNSW tuning for production semantic search",
    "tags": ["ai", "search", "embeddings"]
  }'

  post "/knowledge" '{
    "title": "Canary Deployment Strategy",
    "content": "Migration plan from blue-green to canary deployments:\n\n1. Traffic splitting via Nginx upstream weights\n2. Health check endpoints: /healthz (liveness), /readyz (readiness)\n3. Metrics to monitor: p99 latency, error rate, CPU/memory\n4. Rollback threshold: error rate > 1% or p99 > 500ms\n5. Progressive rollout: 5% → 25% → 50% → 100%\n\nEstimated zero-downtime after migration. Current blue-green has ~30s window.",
    "knowledgeType": "note",
    "summary": "Step-by-step plan for migrating to canary deployments with zero downtime",
    "tags": ["devops", "deployment", "infrastructure"]
  }'

  post "/knowledge" '{
    "title": "Q4 Market Expansion Analysis",
    "content": "Target markets for Q4 expansion:\n\n1. Southeast Asia (Singapore, Vietnam): Growing tech ecosystem, English-proficient developers\n2. LATAM (Brazil, Mexico): Large developer population, timezone alignment with US\n3. India: Massive scale, price sensitivity requires freemium model\n\nCompetitor analysis:\n- Sunsama: Strong in US/EU, weak in Asia\n- Motion: AI-first but no mobile app\n- Linear: Developer-focused, no personal productivity\n\nGo-to-market: Product Hunt launch → content marketing → community building → partnerships",
    "knowledgeType": "research",
    "summary": "Market analysis for Q4 international expansion — target regions and competitive landscape",
    "tags": ["business", "strategy", "expansion"]
  }'

  post "/knowledge" '{
    "title": "Flink Stream Processing Patterns",
    "content": "Common patterns for real-time data processing with Apache Flink:\n\n1. Event Time Processing: Watermarks for out-of-order events\n2. Windowing: Tumbling (fixed), Sliding (overlap), Session (gap-based)\n3. State Management: ValueState for key-value, ListState for collections\n4. Checkpointing: Exactly-once with RocksDB backend, interval 60s\n5. Side Outputs: Late data handling, error routing\n\nPerformance tuning:\n- Parallelism = number of Kafka partitions\n- Network buffer timeout: 100ms for low latency\n- State TTL: 24h for session state, 7d for aggregations",
    "knowledgeType": "note",
    "summary": "Flink stream processing patterns — windowing, state management, and performance tuning",
    "tags": ["flink", "streaming", "data-engineering"]
  }'

  post "/knowledge" '{
    "title": "NL2SQL Prompt Engineering Guide",
    "content": "Production prompt engineering for natural language to SQL:\n\n1. Schema Linking: Extract relevant tables/columns from user query\n   - TF-IDF for keyword matching\n   - Embedding similarity for semantic matching\n   - Column comment enrichment for context\n\n2. Structured Prompt Template:\n   - System: \"You are a SQL expert. Generate valid HiveSQL.\"\n   - Schema context: DDL + column descriptions + sample values\n   - Few-shot examples: 3-5 query-SQL pairs for the specific domain\n   - Constraints: \"Only use provided tables. No DELETE/UPDATE.\"\n\n3. Post-processing:\n   - AST validation (no DML, no unauthorized tables)\n   - Cost estimation check\n   - Parameter injection prevention\n\nAccuracy: 85%+ on internal benchmarks with DeepSeek.",
    "knowledgeType": "research",
    "summary": "End-to-end NL2SQL pipeline — schema linking, prompt engineering, and safety checks",
    "tags": ["ai", "nl2sql", "prompt-engineering"]
  }'

  # -----------------------------------------------------------------------
  # 7. Knowledge fragments (with metadata, for Library page)
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 7: Create knowledge fragments (with metadata) ---"

  post "/fragments" '{"rawContent": "Neural Synapse Mapping — Extracted findings regarding the latency of signal propagation between synthetic nodes. Observations indicate a non-linear relationship between node density and signal attenuation.", "contentType": "text", "inputSource": "inbox", "metadata": {"project": "Phoenix", "title": "Neural Synapse Mapping", "summary": "Extracted findings regarding the latency of signal propagation between synthetic nodes.", "tags": ["Neuroscience", "AI"], "tasks": ["Verify scaling laws on G-900 cluster", "Document non-linear relationship findings"]}}'
  post "/fragments" '{"rawContent": "Visual Cortex Simulation — Latest simulation results from the G-900 cluster. High fidelity textures rendered. VRAM usage peaked at 22GB. Texture streaming efficiency improved by 15% using the new Crystalline cache algorithm.", "contentType": "image", "inputSource": "inbox", "metadata": {"project": "Research", "title": "Visual Cortex Simulation", "summary": "Latest simulation results from the G-900 cluster. High fidelity textures rendered.", "tags": ["Simulation", "VRAM"], "tasks": ["Optimize Crystalline cache for lower VRAM usage"]}}'
  post "/fragments" '{"rawContent": "CRISPR Editing Log — Automated sequence verification for the last batch. All markers within 0.01% deviation. Recommended for Phase 2 trials.", "contentType": "text", "inputSource": "api", "metadata": {"project": "Bio-Gen", "title": "CRISPR Editing Log", "summary": "Automated sequence verification for the last batch. All markers within 0.01% deviation.", "tags": ["Genomics", "CRISPR"]}}'
  post "/fragments" '{"rawContent": "Quantum Entanglement Protocol — Initial tests on long-range entanglement stability. Coherence maintained for 4.2ms. Data throughput reached 1.2 Gbps.", "contentType": "url", "inputSource": "share_sheet", "metadata": {"project": "Q-Link", "title": "Quantum Entanglement Protocol", "summary": "Initial tests on long-range entanglement stability. Coherence maintained for 4.2ms.", "tags": ["Quantum", "Networking"], "tasks": ["Scale entanglement distance to 50km", "Benchmark throughput against classical link"]}}'
  post "/fragments" '{"rawContent": "Sustainable Energy Grid — Optimization algorithms for distributed solar arrays. Efficiency increased by 12%. Voice memo: The new array optimization seems to be working.", "contentType": "voice", "inputSource": "voice", "metadata": {"project": "Eco-Net", "title": "Sustainable Energy Grid", "summary": "Optimization algorithms for distributed solar arrays. Efficiency increased by 12%.", "tags": ["Energy", "SmartGrid"]}}'
  post "/fragments" '{"rawContent": "Linguistic Pattern Analysis — Cross-lingual semantic drift observed in multi-modal training sets. Drift is most prominent in abstract concepts across Romance languages.", "contentType": "text", "inputSource": "inbox", "metadata": {"project": "NLP-X", "title": "Linguistic Pattern Analysis", "summary": "Cross-lingual semantic drift observed in multi-modal training sets.", "tags": ["Linguistics", "LLM"], "tasks": ["Adjust loss function weights for Romance languages", "Run comparison against V3 embeddings"]}}'

  # -----------------------------------------------------------------------
  # 8. Confirm knowledge fragments via database (optional)
  # -----------------------------------------------------------------------
  echo ""
  echo "--- Step 8: Confirm knowledge fragments ---"

  if [ -n "${DATABASE_URL:-}" ]; then
    psql "${DATABASE_URL}" -c "
      UPDATE fragments
      SET status = 'confirmed',
          confirmed_at = NOW(),
          processed_at = NOW(),
          normalized_content = COALESCE(normalized_content, raw_content)
      WHERE status = 'pending'
        AND metadata->>'title' IS NOT NULL
        AND user_id = (SELECT id FROM users WHERE email = '${EMAIL}');
    "
    echo "  Knowledge fragments confirmed via database"
  else
    echo "  SKIP: Set DATABASE_URL to auto-confirm knowledge fragments."
  fi

  echo ""
  echo "==> Account ${EMAIL} seeded!"
}

# ===========================================================================
# Main: seed all system accounts
# ===========================================================================
echo "==> Ask Dorian Seed Script"
echo "    API: ${API}"
echo "    Accounts: ${ACCOUNTS[*]}"

for i in "${!ACCOUNTS[@]}"; do
  seed_account "${ACCOUNTS[$i]}" "${PASSWORDS[$i]}" "${NAMES[$i]}"
done

echo ""
echo "================================================================"
echo "==> All seeds complete!"
echo ""
echo "    System accounts created:"
echo "    - mock@askdorian.com / mock2024"
echo "    - test@askdorian.com / test2024"
echo ""
echo "    Per-account data:"
echo "    - 4 rituals (1 with isFocus)"
echo "    - 9 tasks (3 today, 4 future, 2 overdue)"
echo "    - 8 events (4 today, 2 tomorrow, 2 day after)"
echo "    - 6 fragments (pending, for Stream)"
echo "    - 6 knowledge entries"
echo "    - 6 knowledge fragments (with metadata, for Library)"
echo ""
echo "    NOTE: Knowledge fragments need DATABASE_URL to auto-confirm."
echo "    Without it, they stay in 'pending' status."
echo "================================================================"
