# Deploying to Cloudflare Workers

## Important Note

The full OpenAI Agents SDK version (`worker.js`) **won't work on Cloudflare Workers** because the Agents SDK requires Node.js APIs that aren't available in the Workers runtime.

Instead, use the **simplified version** (`worker-simple.js`) which uses the OpenAI API directly and works perfectly in Cloudflare Workers.

## Prerequisites

1. A Cloudflare account (free tier works!)
2. Wrangler CLI installed globally:
   ```bash
   npm install -g wrangler
   ```

3. Login to Cloudflare:
   ```bash
   wrangler login
   ```

## Option 1: Deploy the Simplified Worker (Recommended for Cloudflare)

### Step 1: Update wrangler.toml

Update `wrangler.toml` to point to the simplified worker:

```toml
name = "ai-news-newsletter"
main = "worker-simple.js"
compatibility_date = "2025-01-15"

# Cron trigger - runs daily at 8:00 AM UTC
[triggers]
crons = ["0 8 * * *"]

[vars]
# Secrets will be set via wrangler commands
```

### Step 2: Set your secrets

```bash
# OpenAI API Key
wrangler secret put OPENAI_API_KEY
# Enter your key when prompted

# Plunk API Key
wrangler secret put PLUNK_API_KEY
# Enter your key when prompted

# Broadcast mode (true or false)
wrangler secret put PLUNK_BROADCAST_MODE
# Enter: true

# Recipient email (only needed if PLUNK_BROADCAST_MODE is false)
wrangler secret put RECIPIENT_EMAIL
# Enter: your@email.com

# Trigger secret (for manual /trigger endpoint)
wrangler secret put TRIGGER_SECRET
# Enter: your-random-secret-string
```

### Step 3: Deploy

```bash
wrangler deploy
```

That's it! Your worker is now deployed and will run daily at 8:00 AM UTC.

### Step 4: Test

After deployment, you can:

1. **Health check**:
   ```bash
   curl https://ai-news-newsletter.YOUR-SUBDOMAIN.workers.dev/health
   ```

2. **Manual trigger** (for testing):
   ```bash
   curl -H "Authorization: Bearer your-trigger-secret" \
        https://ai-news-newsletter.YOUR-SUBDOMAIN.workers.dev/trigger
   ```

3. **View logs**:
   ```bash
   wrangler tail
   ```

### Step 5: Change the schedule (optional)

Edit `wrangler.toml` to change when the newsletter runs:

```toml
[triggers]
crons = ["0 16 * * *"]  # 4 PM UTC every day
```

Then redeploy:
```bash
wrangler deploy
```

## Option 2: Deploy to a Node.js Platform (For Full Agents SDK)

If you want to use the full OpenAI Agents SDK with all its features, deploy to a platform with full Node.js support:

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create a `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/newsletter",
         "schedule": "0 8 * * *"
       }
     ]
   }
   ```

3. Create `api/newsletter.js`:
   ```javascript
   const { runDailyNewsWorkflow } = require('../workflows/dailyNewsWorkflow');

   export default async function handler(req, res) {
     process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
     process.env.PLUNK_API_KEY = process.env.PLUNK_API_KEY;
     process.env.PLUNK_BROADCAST_MODE = process.env.PLUNK_BROADCAST_MODE;
     process.env.RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

     const result = await runDailyNewsWorkflow();
     res.json(result);
   }
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

5. Add environment variables in the Vercel dashboard

### Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Create a `Procfile`:
   ```
   worker: node test-newsletter.js
   ```

3. Deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

4. Add a cron job in the Railway dashboard

## Monitoring

### Cloudflare Workers

View logs in real-time:
```bash
wrangler tail
```

View logs in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Click your worker
3. Go to Logs tab

### Check if it's working

After the first run (or manual trigger), check:
1. Your email inbox (if single recipient mode)
2. Plunk dashboard to see sent campaigns
3. Worker logs for any errors

## Troubleshooting

### Worker fails to deploy
- Make sure you're logged in: `wrangler whoami`
- Check wrangler.toml syntax
- Try: `wrangler deploy --compatibility-date=2025-01-15`

### Newsletter not sending
- Check logs: `wrangler tail`
- Verify secrets are set: `wrangler secret list`
- Test manually: `curl -H "Authorization: Bearer SECRET" https://your-worker.workers.dev/trigger`

### OpenAI API errors
- Verify your API key is correct
- Check your OpenAI account has credits
- Try a different model (edit `worker-simple.js` to use `gpt-3.5-turbo` instead of `gpt-4-turbo-preview`)

### Plunk API errors
- Verify your Plunk API key
- Check you have contacts in Plunk (for broadcast mode)
- Verify recipient email is set (for single recipient mode)

## Cost Estimates

### Cloudflare Workers (Free Tier)
- 100,000 requests/day free
- Running daily = ~30 requests/month
- **Cost: $0**

### OpenAI API
- GPT-4 Turbo: ~$0.01-0.02 per newsletter
- GPT-3.5 Turbo: ~$0.001 per newsletter
- Monthly (30 newsletters): ~$0.30 (GPT-4) or ~$0.03 (GPT-3.5)

### Plunk
- Free tier: 3,000 emails/month
- **Cost: $0** (for typical usage)

**Total monthly cost: ~$0.30-$0.03** (just OpenAI API costs!)

## Next Steps

1. Test the worker with a manual trigger
2. Wait for the first scheduled run (or adjust cron schedule for sooner)
3. Check your email or Plunk dashboard
4. Monitor logs for any issues
5. Adjust the cron schedule as needed

## Support

If you encounter issues:
1. Check the logs: `wrangler tail`
2. Review the Cloudflare Workers docs: https://developers.cloudflare.com/workers/
3. Check OpenAI API status: https://status.openai.com/
4. Check Plunk API docs: https://docs.useplunk.com/
