# AI News Newsletter

Automated daily AI news newsletter powered by OpenAI Agents, deployed on Cloudflare Workers. Delivers a curated selection of the top 10 AI news stories to your inbox every morning.

## Features

- 🤖 **Autonomous News Discovery**: Uses OpenAI's web search to find latest AI news across the web
- 📖 **Intelligent Curation**: Reads full articles and ranks them by importance and impact
- ✍️ **Engaging Summaries**: Creates compelling headlines and insightful 2-3 sentence summaries
- 📧 **Beautiful Emails**: Sends professionally formatted HTML newsletters via Plunk
- ⏰ **Automated Delivery**: Runs daily at 8 AM UTC via Cloudflare Workers cron triggers
- 🏗️ **Modular Architecture**: Controller pattern with specialized agents for each task

## Architecture

```
Cloudflare Worker (Cron: 8am daily)
          ↓
┌──────────────────────┐
│  Controller Agent    │ (Orchestrates workflow)
└──────────────────────┘
          ↓
          ├──→ News Discovery Agent
          │    └─ Searches web for AI news (OpenAI web search)
          │
          ├──→ Curator Agent
          │    └─ Reads articles, ranks, formats top 10
          │
          └──→ Email Agent
               └─ Sends newsletter via Plunk
```

## Project Structure

```
ai-news-newsletter/
├── agents/                    # Specialized agents
│   ├── controllerAgent.js    # Workflow orchestrator
│   ├── newsDiscoveryAgent.js # Web search for AI news
│   ├── curatorAgent.js       # Article ranking & formatting
│   └── emailAgent.js         # Newsletter delivery
├── tools/                     # Agent tools
│   └── plunkTool.js          # Email sending via Plunk
├── workflows/                 # Workflow definitions
│   └── dailyNewsWorkflow.js  # Main newsletter workflow
├── worker.js                  # Cloudflare Worker entry point
├── wrangler.toml             # Cloudflare configuration
├── test-newsletter.js        # Local testing script
└── package.json              # Dependencies & scripts
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update [.env](.env) with your API keys:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-proj-your-key-here

# Plunk API Key (required - get from https://useplunk.com)
PLUNK_API_KEY=your_plunk_api_key

# Broadcast Mode (required)
# Set to "true" to send to ALL contacts in your Plunk project
# Set to "false" to send to a single recipient email
PLUNK_BROADCAST_MODE=true

# Recipient email (only needed if PLUNK_BROADCAST_MODE is false)
RECIPIENT_EMAIL=your_email@example.com

# Secret for manual triggers (optional)
TRIGGER_SECRET=your-secret-key
```

### 3. Get API Keys

**OpenAI**: Already configured
**Plunk**: Sign up at [useplunk.com](https://useplunk.com) to get your API key

### 4. Choose Delivery Mode

**Broadcast Mode** (`PLUNK_BROADCAST_MODE=true`):
- Sends newsletter to ALL contacts in your Plunk project
- Great for newsletters with subscribers
- Requires contacts to be added in your Plunk dashboard

**Single Recipient** (`PLUNK_BROADCAST_MODE=false`):
- Sends to one specific email address
- Perfect for personal use or testing
- Set `RECIPIENT_EMAIL` to your email

## Local Testing

Test the newsletter workflow locally before deploying:

```bash
npm run test-newsletter
```

This will:
1. Search for the latest AI news
2. Curate the top 10 stories
3. Send a test newsletter to your `RECIPIENT_EMAIL`

## Deployment to Cloudflare Workers

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Set Secrets

Store sensitive values as Cloudflare secrets:

```bash
# Required secrets
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put PLUNK_API_KEY
npx wrangler secret put PLUNK_BROADCAST_MODE
# Enter "true" to broadcast to all contacts, or "false" for single recipient

# Optional secrets (only needed if PLUNK_BROADCAST_MODE is false)
npx wrangler secret put RECIPIENT_EMAIL

# Optional secret for manual triggers
npx wrangler secret put TRIGGER_SECRET
```

### 3. Deploy

```bash
npm run deploy
```

Your worker will be deployed and the cron trigger will run daily at 8 AM UTC.

### 4. View Logs

Monitor your worker in real-time:

```bash
npm run tail
```

## Configuration

### Schedule

The newsletter runs at **8:00 AM UTC** by default. To change the schedule, edit [wrangler.toml](wrangler.toml:17):

```toml
[triggers]
crons = ["0 8 * * *"]  # minute hour day month day-of-week
```

Examples:
- `"0 12 * * *"` - Noon UTC (12:00 PM)
- `"0 16 * * *"` - 4:00 PM UTC
- `"0 0 * * 1"` - Midnight UTC, Mondays only

### Newsletter Content

The curator agent selects stories across these topics:
- LLMs and foundation models
- AI products and tools
- Research breakthroughs
- Industry news and funding
- Policy and regulation
- Ethics and safety
- Open source developments
- AI agents and automation

Modify the curator agent's instructions in [agents/curatorAgent.js](agents/curatorAgent.js:18) to customize topic focus.

## Manual Triggers

### Via Command Line (Local)

```bash
npm run test-newsletter
```

### Via HTTP (Deployed Worker)

```bash
curl -X POST https://your-worker.workers.dev/trigger \
  -H "Authorization: Bearer your-secret-key"
```

### Via Cloudflare Dashboard

1. Go to your Worker in the Cloudflare dashboard
2. Click "Trigger Cron"
3. Select your cron trigger

## How It Works

### 1. News Discovery Agent
- **Uses OpenAI's webSearchTool** - Real-time web search powered by OpenAI
- Performs multiple targeted searches for AI news
- Specifically looks for articles from the past 24-48 hours
- Returns 15-20 article URLs with titles and snippets
- Focuses on credible sources (news sites, blogs, research publications)
- Searches with queries like "AI news today", "latest AI developments", "new AI models released"

### 2. Curator Agent
- Reads the full content of each article URL
- Analyzes importance, credibility, and relevance
- Ranks articles by impact on the AI community
- Selects top 10 diverse stories
- Creates engaging headlines and insightful summaries

### 3. Email Agent
- Formats articles into a beautiful HTML newsletter
- Sends via Plunk email service
- Includes article headlines, summaries, and links

## Costs

**OpenAI API**: ~$0.05-0.10 per newsletter (varies by article count)
**Plunk**: Free tier includes 3,000 emails/month
**Cloudflare Workers**: Free tier includes 100,000 requests/day

Total: ~$1.50-3.00/month for daily newsletters

## Troubleshooting

### Newsletter not sending

1. Check Cloudflare Worker logs: `npm run tail`
2. Verify all secrets are set: `npx wrangler secret list`
3. Test locally first: `npm run test-newsletter`

### Articles not relevant

- Adjust news discovery agent instructions in [agents/newsDiscoveryAgent.js](agents/newsDiscoveryAgent.js:24)
- Modify curator ranking criteria in [agents/curatorAgent.js](agents/curatorAgent.js:36)

### Wrong schedule

- Update cron expression in [wrangler.toml](wrangler.toml:17)
- Note: Cloudflare uses UTC time

## Development

### Adding New Features

The modular architecture makes it easy to extend:

**Add new news sources**: Update discovery agent's search queries
**Change email format**: Modify the HTML template in [tools/plunkTool.js](tools/plunkTool.js:54)
**Add filters**: Create a new agent with specific filtering tools
**Multiple recipients**: Modify email agent to loop through recipient list

### Testing Changes

1. Make your changes
2. Test locally: `npm run test-newsletter`
3. Deploy: `npm run deploy`
4. Monitor: `npm run tail`

## Learn More

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-js/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Plunk Email API](https://docs.useplunk.com/)

## License

ISC
