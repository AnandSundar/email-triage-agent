# AI Email Triage & Response Agent - Quick Start Guide

## Project Overview

A complete AI-powered email triage agent built with:
- **LangGraph** for email classification and drafting
- **Streamlit** for the web interface
- **Gmail API** for email integration
- **Presidio** for PII detection
- **APScheduler** for follow-up scheduling

## Project Structure

```
email-triage-agent/
├── app.py                        # Streamlit entrypoint
├── requirements.txt              # Python dependencies
├── Makefile                      # Build commands
├── .env.example                  # Environment template
│
├── graph/                        # LangGraph workflow
│   ├── state.py                  # State definition
│   ├── nodes.py                  # Processing nodes
│   ├── graph.py                  # Graph assembly
│   └── prompts.py                # LLM prompts
│
├── services/                     # Core services
│   ├── gmail_service.py          # Gmail API
│   ├── pii_scrubber.py           # PII detection
│   └── scheduler.py              # Follow-up scheduler
│
├── models/                       # Pydantic models
│   └── schemas.py                # All data models
│
├── db/                           # Database layer
│   └── store.py                  # SQLite CRUD
│
├── demo/                         # Demo mode
│   └── mock_emails.py            # 12 mock emails
│
├── ui/                           # Streamlit UI
│   ├── sidebar.py                # Sidebar controls
│   ├── tab_inbox.py              # Inbox tab
│   ├── tab_drafts.py             # Drafts tab
│   ├── tab_followups.py          # Follow-ups tab
│   └── tab_analytics.py          # Analytics tab
│
└── tests/                        # Test suite
    ├── test_classifier.py
    ├── test_drafter.py
    └── test_pii_scrubber.py
```

## Installation

1. **Install dependencies:**
   ```bash
   make install
   # or
   pip install -r requirements.txt
   python -m spacy download en_core_web_lg
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **For Gmail integration:**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com)
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Download `credentials.json` to the project root

## Running the Application

### Demo Mode (No API keys required)
```bash
make demo
# or
DEMO_MODE=true streamlit run app.py
```

### Production Mode (with Gmail)
```bash
make run
# or
streamlit run app.py
```

## Running Tests

```bash
make test
# or
pytest tests/ -v
```

## Features

### 📨 Inbox Triage
- Automatic email classification by priority (urgent/high/normal/low)
- Intent detection (question, action_request, meeting_request, etc.)
- PII redaction before LLM processing
- Smart routing based on email content

### 📝 Draft Review
- AI-generated email drafts
- Quality scoring (0-1)
- Professional tone detection
- Human review queue for low-quality drafts

### ⏰ Follow-ups
- Automatic follow-up scheduling
- Thread-aware reply detection
- APScheduler-based reminders

### 📊 Analytics
- Email volume trends
- Priority distribution
- Intent breakdown
- Agent run history

## Security Features

- **PII Detection:** All emails are scrubbed for PII before LLM processing
- **No Full Body Storage:** Only 200-char snippets stored in database
- **Auto-send OFF by default:** All drafts require human review
- **OAuth2:** Secure Gmail authentication

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM | Required |
| `DEMO_MODE` | Run without Gmail/API | `false` |
| `AUTO_SEND_THRESHOLD` | Quality threshold for auto-save | `0.90` |
| `MAX_EMAILS_PER_RUN` | Max emails per triage run | `20` |
| `USER_NAME` | Your name for signatures | `Your Name` |
| `USER_SIGNATURE` | Email signature | `Best, Your Name` |

### Auto-Send Threshold

- **< 0.85:** Auto-send is OFF (manual review required)
- **0.85 - 0.99:** Drafts saved to Gmail, still require review
- **≥ 0.90:** Recommended threshold for balanced automation

## Email Priority Levels

| Priority | Emoji | Description | Auto-Reply |
|----------|-------|-------------|------------|
| urgent | 🔴 | Action needed < 2 hours | No |
| high | 🟠 | Action needed today | No |
| normal | 🟡 | Action needed this week | Yes |
| low | 🟢 | FYI only, no action | No |

## Intent Types

- `question` - Asking for information
- `action_request` - Requesting action
- `meeting_request` - Scheduling meeting
- `job_opportunity` - Recruiter outreach
- `invoice_payment` - Billing/payment
- `sales_outreach` - Cold sales
- `information_only` - FYI, no reply needed
- `spam` - Unsolicited email

## Troubleshooting

### Gmail Authentication Issues
```bash
# Remove existing token
rm token.pickle
# Re-run the app
streamlit run app.py
```

### Database Issues
```bash
# Remove database and reinitialize
rm db/*.db
streamlit run app.py
```

### Dependency Issues
```bash
# Create fresh virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## Development

### Code Style
```bash
make lint
# or
ruff check . && mypy . --ignore-missing-imports
```

### Testing
```bash
# Run all tests
pytest tests/ -v

# Run specific test
pytest tests/test_pii_scrubber.py -v

# Run with coverage
pytest tests/ --cov=.
```

## Production Deployment

1. Set up a reverse proxy (nginx)
2. Use environment variables for secrets
3. Enable HTTPS
4. Set `DEMO_MODE=false`
5. Configure proper logging

## License

This is a demonstration project for educational purposes.

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.
