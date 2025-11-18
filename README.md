# Agent News

Automated daily newsletter focused exclusively on AI agents - autonomous AI systems that use tools, make decisions, and take actions. Powered by OpenAI Agents SDK, deployed on Vercel.

🔗 **Live at**: [agent-news.toy.energy](https://agent-news.toy.energy)

## Features

- 🤖 **Autonomous Agents**: Built with OpenAI Agents SDK - real autonomous agents curating news about agents
- 🔍 **Focused on Agents**: Exclusively covers AI agents, agent frameworks, multi-agent systems, and agentic AI
- 📖 **Intelligent Curation**: Reads full articles and ranks them by importance to the agents ecosystem
- ✍️ **Engaging Summaries**: Creates compelling headlines with 2-3 sentence explanations of why it matters
- 📧 **Beautiful Emails**: Sends professionally formatted HTML newsletters via Plunk
- ⏰ **Automated Delivery**: Runs daily at 8 AM UTC via Vercel Cron
- 🌐 **Public Signup**: Beautiful landing page for newsletter subscriptions

## What Gets Covered

- Agent frameworks (AutoGPT, LangGraph, CrewAI, etc.)
- Multi-agent systems and collaboration
- Agent tools and capabilities
- Research on agentic AI and tool use
- Agent startups and products
- Enterprise agent deployments
- Open source agent projects
- Agent safety and alignment

## Architecture

```
Vercel Cron (Daily 8am UTC)
          ↓
┌──────────────────────┐
│  Controller Agent    │ (Orchestrates workflow)
└──────────────────────┘
          ↓
    Uses Tools:
    ├─ web_search → Find AI agents news
    ├─ (Agent does curation inline)
    └─ send_newsletter → Deliver via Plunk
```

**Key Insight**: This uses the actual OpenAI Agents SDK with real autonomous behavior - the agents decide when to search, what to curate, and when to send. Not a simple script!

## Project Structure

```
agent-news/
├── agents/                    # Autonomous agents
│   └── controllerAgent.js    # Main orchestrator agent
├── tools/                     # Agent tools
│   ├── plunkTool.js          # Email sending via Plunk
│   └── index.js              # Tools export
├── workflows/                 # Workflow definitions
│   └── dailyNewsWorkflow.js  # Main newsletter workflow
├── api/                       # Vercel serverless functions
│   ├── newsletter.js         # Cron endpoint
│   ├── subscribe.js          # Newsletter signup
│   └── health.js             # Health check
├── public/                    # Static website
│   └── index.html            # Landing page
├── test-newsletter.js        # Local testing script
├── vercel.json               # Vercel configuration
└── package.json              # Dependencies
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/toy-studio/agent-news.git
cd agent-news
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
# Required
OPENAI_API_KEY=sk-proj-your-key-here
PLUNK_API_KEY=sk_your-plunk-key-here

# Optional
PLUNK_BROADCAST_MODE=true          # true = send to all contacts, false = single recipient
RECIPIENT_EMAIL=you@example.com    # Only needed if PLUNK_BROADCAST_MODE=false
TRIGGER_SECRET=your-secret-key     # For manual triggering
```

### 3. Test Locally

```bash
npm run test-newsletter
```

This will run the full agent workflow and send a test newsletter!

### 4. Deploy to Vercel

**Option A: Via GitHub (Recommended)**

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

**Option B: Via CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then set secrets:
```bash
vercel env add OPENAI_API_KEY
vercel env add PLUNK_API_KEY
vercel env add PLUNK_BROADCAST_MODE
vercel env add TRIGGER_SECRET
```

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## Usage

### Automated Daily Delivery

The newsletter runs automatically every day at 8:00 AM UTC via Vercel Cron.

### Manual Trigger

Test the workflow anytime:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR-TRIGGER-SECRET" \
  https://your-project.vercel.app/api/newsletter
```

### Subscribe to the Newsletter

Visit [agent-news.toy.energy](https://agent-news.toy.energy) to subscribe!

## Newsletter Signup

The project includes a beautiful landing page where people can subscribe:

- Clean, minimal design with Tailwind CSS
- Dark mode support
- Automatic welcome emails
- Plunk integration for contact management

## Configuration

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/newsletter",
      "schedule": "0 8 * * *"  // 8 AM UTC daily
    }
  ]
}
```

Cron format: `minute hour day month day-of-week`

Examples:
- `"0 8 * * *"` - 8:00 AM UTC daily
- `"0 16 * * *"` - 4:00 PM UTC daily
- `"0 9 * * 1-5"` - 9:00 AM UTC weekdays only

### Customize Agent Behavior

Edit [agents/controllerAgent.js](agents/controllerAgent.js) to:
- Change search queries
- Adjust curation criteria
- Modify newsletter format
- Add new tools

## Tech Stack

- **OpenAI Agents SDK** - Autonomous agent orchestration
- **Vercel** - Hosting and cron jobs
- **Plunk** - Email delivery
- **Tailwind CSS** - Landing page styling

## Costs

| Service | Cost |
|---------|------|
| Vercel (Hobby) | **Free** ✅ |
| OpenAI API | ~$0.30/month (GPT-4) or ~$0.03/month (GPT-3.5) |
| Plunk (Free tier) | **Free** (up to 3,000 emails/month) ✅ |
| **Total** | **$0.03 - $0.30/month** 🎉 |

## Monitoring

### View Logs

In Vercel Dashboard:
1. Go to your project
2. Click "Functions"
3. Click `/api/newsletter`
4. View execution logs

Or via CLI:
```bash
vercel logs
vercel logs --follow
```

### Health Check

```bash
curl https://your-project.vercel.app/api/health
```

## Troubleshooting

See [DEPLOY.md](DEPLOY.md) for comprehensive troubleshooting guide.

Common issues:
- **"OPENAI_API_KEY not set"**: Add env var in Vercel dashboard
- **Function timeout**: Upgrade to Pro for 60s timeout (Hobby = 10s)
- **Newsletter not sending**: Check Vercel logs, verify Plunk API key

## Contributing

This is an open source project! Feel free to:
- Fork and customize
- Submit PRs for improvements
- Open issues for bugs
- Share your own agent-focused newsletter

## License

MIT

## Credits

Built by [toy.studio](https://toy.studio) as an example of autonomous AI agents in production.

Powered by:
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-js)
- [Plunk](https://useplunk.com)
- [Vercel](https://vercel.com)
