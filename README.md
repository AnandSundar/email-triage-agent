# AI Email Triage & Response Agent

**Intelligent email classification, draft generation, and follow-up scheduling — powered by LangGraph.**

Professionals spend 28% of their workday managing email. This agent automates the tedious parts: reading an email, judging its priority, determining the intent, drafting a reply, and scheduling follow-ups. What remains is human review, not human labor.

---

## The Problem

The average knowledge worker processes **120 emails per day**. Reading, classifying, and drafting responses consumes hours — time that disappears from deep work. Most emails follow predictable patterns: questions, action requests, meeting setups, invoices. The agent handles the pattern; you handle the judgment.

---

## Key Features

| | | | |
|---|---|---|---|
| **Smart Triage** | **Draft Generation** | **Follow-up Scheduling** | **Privacy-First AI** |
| Classifies emails by priority (urgent / high / medium / low) and intent (question, request, meeting, invoice, etc.) | AI-generated email drafts with quality scoring. Human review before any send. | Detects when you've promised a follow-up and schedules reminders automatically. | All emails pass through a PII scrubber before LLM processing. No email bodies stored — only 200-character snippets. |

| | | | |
|---|---|---|---|
| **Gmail Integration** | **Demo Mode** | **Analytics Dashboard** | **Production-Ready** |
| Connects to real Gmail accounts via OAuth2. Fetches, triages, and drafts in your actual inbox. | No API keys or Gmail credentials required. Twelve realistic mock emails included for immediate demo. | Track email volume, priority distribution, and intent breakdown over time. | Structured error handling, SQLite persistence, graceful degradation, and a clear deployment path. |

---

## Architecture

```
                          ┌─────────────────────────────────────────────────────┐
                          │                    Frontend                         │
                          │              React + TypeScript + Vite             │
                          │         Bootstrap 5 · React Router · Chart.js       │
                          └─────────────────────────┬───────────────────────────┘
                                                    │ REST API
        ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
        │                                           │              Backend                       │
        │                      ┌────────────────────┴────────────────────┐                        │
        │                      │         Node.js + Express + TypeScript          │                │
        │                      │              REST API Server                      │                │
        │                      └────────────────────┬────────────────────┘                        │
        │                                           │                                            │
        │              ┌────────────────────────────┼────────────────────────────────┐           │
        │              │                            │                                 │           │
        │      ┌───────┴───────┐          ┌───────┴───────┐             ┌─────────┴────────┐   │
        │      │  Gmail Service │          │  AI Service   │             │   Scheduler     │   │
        │      │   (OAuth2)     │          │  (LangGraph)  │             │  (APScheduler)   │   │
        │      └───────┬───────┘          └───────┬───────┘             └─────────┬────────┘   │
        │              │                          │                                  │            │
        │              │              ┌───────────┴───────────┐                     │            │
        │              │              │    PII Scrubber       │                     │            │
        │              │              │     (Presidio)        │                     │            │
        │              │              └───────────┬───────────┘                     │            │
        │              │                          │                                  │            │
        │              └──────────────────────────┼──────────────────────────────────┘            │
        │                                             │                                            │
        │                                   ┌─────────┴─────────┐                                      │
        │                                   │     SQLite DB     │                                      │
        │                                   │  (snippets only)  │                                      │
        │                                   └───────────────────┘                                      │
        └─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Data flow:** Gmail → Authentication → PII Scrubber → LangGraph Classifier → Intent Detection → Draft Generation → Quality Scoring → SQLite (snippets) → Frontend Dashboard

---

## Tech Stack

| **Frontend** | **Backend** | **AI / ML** | **Data** |
|---|---|---|---|
| React 19 | Node.js + Express | LangGraph | SQLite |
| TypeScript | TypeScript | Anthropic AI | — |
| Vite | REST API | Presidio (PII) | — |
| Bootstrap 5 | APScheduler | — | — |
| Chart.js | — | — | — |

---

## Security & Privacy

Email data is sensitive by nature. This agent treats it accordingly.

| Feature | Implementation |
|---|---|
| **PII Detection** | All email bodies pass through Microsoft's Presidio before reaching any LLM. Names, emails, phone numbers, SSNs, and credit cards are detected and redacted. |
| **Minimal Storage** | Email bodies are never stored in full. Only 200-character snippets survive to the database, sufficient for display in the dashboard. |
| **No Auto-Send** | Every draft requires human review. The auto-send feature is off by default and gated behind a configurable quality threshold. |
| **OAuth2 for Gmail** | Gmail integration uses Google's official OAuth 2.0 flow. No app passwords or credential storage. |
| **Demo Mode Isolation** | Demo mode uses entirely synthetic data. No real emails, no external API calls. |

---

## Getting Started

### 1. Clone & install

```bash
git clone <repository-url>
cd email-triage-agent
npm install
```

### 2. Start demo mode (no credentials required)

```bash
npm run dev
```

Open `http://localhost:5173`. Twelve realistic mock emails are pre-loaded. Click **Run Triage** to watch the agent classify, draft, and schedule.

### 3. Connect real Gmail (optional)

```bash
cp .env.example .env
# Add your OPENAI_API_KEY and configure Gmail OAuth credentials
npm run dev
```

See [QUICKSTART.md](QUICKSTART.md) for full Gmail setup instructions.

---

## Project Structure

```
email-triage-agent/
├── src/                          # React frontend
│   ├── pages/
│   │   ├── Inbox.tsx             # Email list with filters
│   │   ├── Drafts.tsx            # Draft review queue
│   │   ├── Followups.tsx         # Scheduled follow-up tracker
│   │   └── Analytics.tsx         # Volume and distribution charts
│   ├── components/
│   │   └── Layout.tsx            # Sidebar + navbar shell
│   └── services/
│       └── api.ts                # Typed API client
│
├── backend/                      # Node.js + Express API
│   └── src/
│       ├── routes/
│       │   ├── emails.ts         # GET /emails, POST /emails/fetch
│       │   ├── drafts.ts         # Draft CRUD
│       │   ├── followups.ts      # Follow-up management
│       │   ├── analytics.ts      # Aggregated metrics
│       │   └── triage.ts         # POST /triage/run
│       ├── services/
│       │   ├── gmailService.ts   # Gmail API integration
│       │   ├── aiService.ts      # LangGraph orchestration
│       │   ├── piiScrubber.ts    # Presidio-based PII redaction
│       │   ├── scheduler.ts      # APScheduler follow-up engine
│       │   └── mockEmails.ts     # 12 realistic demo emails
│       ├── db/
│       │   └── database.ts       # SQLite connection + queries
│       └── middleware/
│           └── auth.ts           # Gmail OAuth middleware
```

---

## Running Tests

```bash
# All tests
npm run test

# With coverage
npm run test -- --coverage

# Specific suite
npm run test -- email-triage-agent/tests/test_classifier.py
```

---

## Configuration

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | Anthropic API key for LLM inference | Required (production) |
| `DEMO_MODE` | Use mock emails instead of Gmail | `true` |
| `AUTO_SEND_THRESHOLD` | Draft quality score required for auto-save | `0.90` |
| `MAX_EMAILS_PER_RUN` | Maximum emails processed per triage cycle | `20` |
| `USER_NAME` | Your name, used in draft signatures | `Your Name` |
| `USER_SIGNATURE` | Email signature appended to drafts | `Best, Your Name` |

---

## Deployment

1. Set environment variables in production
2. Configure a reverse proxy (nginx) with HTTPS
3. Set `DEMO_MODE=false`
4. Point `token.pickle` (Gmail OAuth) to a persistent volume
5. Review the auto-send threshold before enabling

---

## License

This project is for demonstration and educational purposes.

---

*Built with LangGraph, React, and a healthy respect for inbox zero.*
