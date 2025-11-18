# Quick Setup Guide

## Prerequisites

- Node.js installed
- OpenAI API key (already configured)
- Plunk API key from [useplunk.com](https://useplunk.com)
- Cloudflare account (free tier works)

## Quick Start (5 minutes)

### 1. Configure Your Settings

Edit [.env](.env):
```env
PLUNK_API_KEY=your_actual_plunk_key

# Choose your delivery mode:
PLUNK_BROADCAST_MODE=true   # Send to ALL contacts in Plunk (recommended)
# OR
PLUNK_BROADCAST_MODE=false  # Send to single email below
RECIPIENT_EMAIL=your_email@example.com
```

**Broadcast Mode vs Single Recipient:**
- **Broadcast (`true`)**: Sends to all contacts in your Plunk project (perfect for newsletters!)
- **Single (`false`)**: Sends to one email address (good for testing)

### 2. Test Locally

```bash
npm run test-newsletter
```

This will send a test newsletter to your email! Check your inbox.

### 3. Deploy to Cloudflare

```bash
# Login to Cloudflare
npx wrangler login

# Set secrets
npx wrangler secret put OPENAI_API_KEY
# Paste your key when prompted

npx wrangler secret put PLUNK_API_KEY
# Paste your Plunk key when prompted

npx wrangler secret put PLUNK_BROADCAST_MODE
# Enter "true" for broadcast mode or "false" for single recipient

npx wrangler secret put RECIPIENT_EMAIL
# Only needed if PLUNK_BROADCAST_MODE is "false"

# Deploy!
npm run deploy
```

Done! Your newsletter will now run automatically every day at 8 AM UTC.

## What Happens Next

Your Cloudflare Worker will:
1. **8:00 AM UTC every day**: Automatically trigger
2. **Discovery** (~30 sec): Search for latest AI news
3. **Curation** (~1-2 min): Read articles, rank them, select top 10
4. **Email** (~5 sec): Send beautiful newsletter (broadcast or single recipient based on your settings)

## Monitoring

View real-time logs:
```bash
npm run tail
```

## Customization

### Change Schedule
Edit [wrangler.toml](wrangler.toml):
```toml
crons = ["0 12 * * *"]  # Noon UTC instead of 8 AM
```

### Change Topics
Edit [agents/curatorAgent.js](agents/curatorAgent.js) to focus on specific AI topics.

### Change Email Style
Edit [tools/plunkTool.js](tools/plunkTool.js) to modify the HTML template.

## Troubleshooting

### "No newsletter received"
1. Check logs: `npm run tail`
2. Test locally first: `npm run test-newsletter`
3. Verify secrets: `npx wrangler secret list`

### "Articles not relevant"
- Curator agent learns over time
- Adjust discovery queries in [agents/newsDiscoveryAgent.js](agents/newsDiscoveryAgent.js)

### "Wrong time"
- Cron uses UTC (not your local timezone)
- Convert your desired time to UTC first

## Cost Estimate

- OpenAI: ~$0.05-0.10 per newsletter
- Plunk: Free (up to 3,000 emails/month)
- Cloudflare: Free (generous limits)

**Total**: ~$1.50-3/month for daily newsletters

## Next Steps

1. ✅ Test locally with `npm run test-newsletter`
2. ✅ Review the test newsletter in your inbox
3. ✅ Deploy to Cloudflare with `npm run deploy`
4. ✅ Monitor first few runs with `npm run tail`
5. ✅ Customize to your preferences

Enjoy your daily AI news! 🤖📰
