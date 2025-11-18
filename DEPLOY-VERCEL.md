# Deploying to Vercel (Recommended - Keeps Full Agent System)

This guide will help you deploy your AI News Newsletter with the **full OpenAI Agents SDK** to Vercel for free.

## Why Vercel?

- ✅ **FREE** for this use case (Hobby plan)
- ✅ Supports full Node.js runtime (OpenAI Agents SDK works!)
- ✅ Built-in cron jobs
- ✅ Easy deployment (one command)
- ✅ Automatic HTTPS
- ✅ Great logging and monitoring

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git installed
3. Your code pushed to GitHub, GitLab, or Bitbucket (or use Vercel CLI)

## Option 1: Deploy via GitHub (Easiest)

### Step 1: Push to GitHub

If not already done:

```bash
# Initialize git repo (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

In the Vercel import screen, add these environment variables:

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key (starts with `sk-`) |
| `PLUNK_API_KEY` | Your Plunk API key (starts with `sk_`) |
| `PLUNK_BROADCAST_MODE` | `true` (or `false` for single recipient) |
| `RECIPIENT_EMAIL` | Your email (only needed if PLUNK_BROADCAST_MODE is false) |
| `TRIGGER_SECRET` | A random string for manual triggers (e.g., `my-secret-key-123`) |

### Step 4: Deploy

Click **"Deploy"** and wait ~1 minute.

✅ Done! Your newsletter agent is deployed!

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to production
vercel --prod
```

### Step 4: Set Environment Variables

```bash
# Set secrets via CLI
vercel env add OPENAI_API_KEY
# Paste your key when prompted

vercel env add PLUNK_API_KEY
# Paste your key when prompted

vercel env add PLUNK_BROADCAST_MODE
# Enter: true

vercel env add RECIPIENT_EMAIL
# Enter: your@email.com (if not using broadcast)

vercel env add TRIGGER_SECRET
# Enter: your-random-secret
```

Then redeploy:
```bash
vercel --prod
```

## Configure the Cron Schedule

The cron schedule is set in `vercel.json`:

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

**Current schedule**: Runs daily at 8:00 AM UTC

### Change the Schedule

Edit `vercel.json` to your preferred time:

| Schedule | Description |
|----------|-------------|
| `"0 8 * * *"` | 8:00 AM UTC daily |
| `"0 12 * * *"` | 12:00 PM UTC daily (noon) |
| `"0 16 * * *"` | 4:00 PM UTC daily |
| `"0 0 * * *"` | Midnight UTC daily |
| `"0 9 * * 1-5"` | 9:00 AM UTC weekdays only |

After changing, commit and push (or redeploy):
```bash
git add vercel.json
git commit -m "Update cron schedule"
git push
```

Vercel will auto-redeploy.

## Test Your Deployment

### 1. Health Check

```bash
curl https://your-project.vercel.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-...",
  "hasOpenAIKey": true,
  "hasPlunkKey": true,
  "broadcastMode": true
}
```

### 2. Manual Trigger (Test Newsletter)

```bash
curl -X GET \
  -H "Authorization: Bearer your-trigger-secret" \
  https://your-project.vercel.app/api/newsletter
```

This will run the full agent workflow:
1. Web search for AI news
2. Curate top 10 articles
3. Send newsletter via Plunk

Check your email or Plunk dashboard!

## View Logs

### In Vercel Dashboard

1. Go to your project at https://vercel.com/dashboard
2. Click your project
3. Go to "Functions" tab
4. Click on `/api/newsletter`
5. View execution logs

### Via CLI

```bash
vercel logs
```

Or follow logs in real-time:
```bash
vercel logs --follow
```

## Monitoring

### Check Cron Runs

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Look for automatic deployments triggered by cron

### Email Notifications

Vercel will email you if:
- Deployment fails
- Function errors occur
- Cron job fails

Configure in: Project Settings → Notifications

## Update Your Code

### If using GitHub (auto-deploy):

```bash
# Make changes to your code
git add .
git commit -m "Update newsletter agent"
git push
```

Vercel automatically redeploys on push!

### If using CLI:

```bash
# Make changes, then:
vercel --prod
```

## Troubleshooting

### Cron not running

1. Check cron is configured in `vercel.json`
2. Verify you're on a Pro plan OR using Hobby with a verified payment method
3. Wait up to 5 minutes after deployment for cron to activate
4. Check logs: `vercel logs`

### "OPENAI_API_KEY not set" error

```bash
# Verify environment variable is set
vercel env ls

# If missing, add it:
vercel env add OPENAI_API_KEY production
# Paste your key

# Redeploy
vercel --prod
```

### Function timeout (10 seconds on Hobby)

**Important**: Free plan has 10-second timeout. Your agents might take longer!

**Solution**: Upgrade to Pro ($20/month) for 60-second timeout, or:
- Reduce article count in instructions
- Use faster model (gpt-3.5-turbo)
- Optimize agent instructions

### Newsletter not sending

1. Check logs: `vercel logs`
2. Test manually: `curl -H "Authorization: Bearer SECRET" https://your-project.vercel.app/api/newsletter`
3. Verify Plunk API key is correct
4. Check OpenAI account has credits

### Module not found errors

Make sure all dependencies are in `package.json`:

```bash
# Install missing packages
npm install @openai/agents @plunk/node dotenv

# Commit package.json and package-lock.json
git add package.json package-lock.json
git commit -m "Add dependencies"
git push
```

## Cost Breakdown

| Service | Cost |
|---------|------|
| **Vercel (Hobby)** | **$0/month** ✅ |
| OpenAI API (GPT-4) | ~$0.30/month |
| OpenAI API (GPT-3.5) | ~$0.03/month |
| Plunk (Free tier) | **$0/month** ✅ |
| **Total** | **$0.03-$0.30/month** 🎉 |

### When you'd pay for Vercel:

- **Never** for this use case on Hobby plan!
- Only if you need:
  - Team collaboration
  - Longer function timeouts (60s instead of 10s)
  - Password protection
  - Advanced analytics

## What Runs Daily

Every day at 8:00 AM UTC (or your chosen time), Vercel automatically:

1. ✅ Triggers `/api/newsletter` endpoint
2. ✅ Runs your **full agent system**:
   - Controller agent orchestrates workflow
   - News discovery agent uses web search
   - Curator agent analyzes and curates
   - Email agent sends via Plunk
3. ✅ Logs results to Vercel dashboard
4. ✅ Sends email notification if errors occur

**This is the REAL agent system** with tools, web search, and autonomous decision-making!

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Test with manual trigger
4. ✅ Wait for first scheduled run (or adjust cron for sooner)
5. ✅ Check your email!
6. ✅ Monitor logs in Vercel dashboard

## Advanced: Custom Domain

Want `newsletter.yourdomain.com`?

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your domain
4. Update DNS records as instructed
5. Done! Now trigger with: `https://newsletter.yourdomain.com/api/newsletter`

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Check logs: `vercel logs`

## Comparison: Vercel vs Cloudflare Workers

| Feature | Vercel | Cloudflare Workers |
|---------|--------|-------------------|
| **OpenAI Agents SDK** | ✅ YES | ❌ NO |
| **Full Node.js** | ✅ YES | ❌ Limited |
| **Cron Jobs** | ✅ Built-in | ✅ Built-in |
| **Free Tier** | ✅ Generous | ✅ Very generous |
| **Deployment** | ✅ Easy | ✅ Easy |
| **For this project** | ✅✅✅ **RECOMMENDED** | ⚠️ Requires simplified version |

**Verdict**: Use Vercel to keep your full agent system with all capabilities!
