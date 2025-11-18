const { tool } = require('@openai/agents');
const { z } = require('zod');
const Plunk = require('@plunk/node').default;

/**
 * Plunk Email Tool
 * Sends beautifully formatted newsletter emails via Plunk
 * Supports both single recipient and broadcast to all contacts
 */
const sendNewsletterTool = tool({
  name: 'send_newsletter',
  description: 'Send a formatted newsletter email with curated AI news articles. Can send to a specific email or broadcast to all contacts in the Plunk project.',
  parameters: z.object({
    articles: z.array(z.object({
      headline: z.string(),
      summary: z.string(),
      url: z.string(),
    })).describe('Array of curated articles to include in the newsletter'),
    broadcastToAll: z.boolean().optional().default(false).describe('If true, send to all contacts in Plunk project. If false, send to recipientEmail.'),
    recipientEmail: z.string().email().optional().describe('Email address to send the newsletter to (only used if broadcastToAll is false)'),
    date: z.string().optional().describe('Date for the newsletter (defaults to today)'),
  }),
  execute: async (input) => {
    try {
      // Check if Plunk API key is set
      if (!process.env.PLUNK_API_KEY) {
        throw new Error('PLUNK_API_KEY environment variable is not set');
      }

      console.log('🔑 Plunk API Key found:', process.env.PLUNK_API_KEY.substring(0, 10) + '...');

      const plunk = new Plunk(process.env.PLUNK_API_KEY);

      const newsletterDate = input.date || new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Determine if we're broadcasting or sending to single recipient
      const isBroadcast = input.broadcastToAll || process.env.PLUNK_BROADCAST_MODE === 'true';

      console.log('\n' + '='.repeat(60));
      console.log('📧 PLUNK EMAIL TOOL - STARTING');
      console.log('='.repeat(60));
      console.log(`Mode: ${isBroadcast ? 'BROADCAST' : 'SINGLE RECIPIENT'}`);
      console.log(`PLUNK_BROADCAST_MODE env: ${process.env.PLUNK_BROADCAST_MODE}`);
      console.log(`Articles received: ${input.articles.length}`);
      console.log(`Newsletter date: ${newsletterDate}`);

      if (isBroadcast) {
        console.log(`📧 Broadcasting newsletter to ALL contacts in Plunk project`);
      } else {
        const recipient = input.recipientEmail || process.env.RECIPIENT_EMAIL;
        if (!recipient) {
          throw new Error('No recipient email specified and RECIPIENT_EMAIL not set in environment');
        }
        console.log(`📧 Sending to single recipient: ${recipient}`);
      }

      console.log('\n📰 Articles to be sent:');
      input.articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.headline}`);
        console.log(`     URL: ${article.url}`);
        console.log(`     Summary: ${article.summary.substring(0, 100)}...`);
      });
      console.log('='.repeat(60) + '\n');

      // Create HTML email content
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1f2937;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .date {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
    .article {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #e5e7eb;
    }
    .article:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .article-number {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-size: 14px;
      font-weight: bold;
      margin-right: 10px;
    }
    .article-headline {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin: 10px 0;
      line-height: 1.4;
    }
    .article-headline a {
      color: #1f2937;
      text-decoration: none;
    }
    .article-headline a:hover {
      color: #3b82f6;
    }
    .article-summary {
      color: #4b5563;
      margin: 10px 0;
      font-size: 15px;
    }
    .read-more {
      display: inline-block;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
    }
    .read-more:hover {
      text-decoration: underline;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI News Daily</h1>
      <p class="date">${newsletterDate}</p>
    </div>

    ${input.articles.map((article, index) => `
    <div class="article">
      <div>
        <span class="article-number">${index + 1}</span>
      </div>
      <h2 class="article-headline">
        <a href="${article.url}" target="_blank">${article.headline}</a>
      </h2>
      <p class="article-summary">${article.summary}</p>
      <a href="${article.url}" class="read-more" target="_blank">Read more →</a>
    </div>
    `).join('')}

    <div class="footer">
      <p>This newsletter was curated by AI agents using OpenAI and Firecrawl</p>
      <p>Sent with ❤️ by your AI news assistant</p>
    </div>
  </div>
</body>
</html>
      `;

      // Send email via Plunk
      let result;

      console.log('📤 Sending email via Plunk API...\n');

      if (isBroadcast) {
        // Send to all contacts using Plunk's campaigns API
        // Step 1: Create the campaign
        // Step 2: Send the campaign
        console.log('🔧 Step 1: Creating Plunk Campaign');
        console.log(`   name: "AI News Daily - ${newsletterDate}"`);
        console.log(`   subject: "🤖 AI News Daily - ${newsletterDate}"`);
        console.log(`   body: HTML content (${htmlContent.length} characters)`);
        console.log(`   style: "PLUNK"`);

        const campaign = await plunk.campaigns.create({
          name: `AI News Daily - ${newsletterDate}`,
          subject: `🤖 AI News Daily - ${newsletterDate}`,
          body: htmlContent,
          style: 'PLUNK',
        });

        console.log('\n✅ Campaign Created:');
        console.log(JSON.stringify(campaign, null, 2));
        console.log(`   Campaign ID: ${campaign.id}`);

        // Step 2: Send the campaign to all contacts
        console.log('\n🔧 Step 2: Sending Campaign to All Contacts');

        result = await plunk.campaigns.send(campaign.id);

        console.log('\n✅ Campaign Sent Successfully:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n✅ Newsletter broadcast successfully to all contacts!`);

        return {
          success: true,
          messageId: campaign.id,
          campaignId: campaign.id,
          recipient: 'all contacts (broadcast)',
          articleCount: input.articles.length,
          date: newsletterDate,
          broadcast: true,
        };
      } else {
        // Send to single recipient
        const recipient = input.recipientEmail || process.env.RECIPIENT_EMAIL;

        console.log('🔧 Plunk API Call Details:');
        console.log(`   to: "${recipient}"`);
        console.log(`   subject: "🤖 AI News Daily - ${newsletterDate}"`);
        console.log(`   body: HTML content (${htmlContent.length} characters)`);

        result = await plunk.emails.send({
          to: recipient,
          subject: `🤖 AI News Daily - ${newsletterDate}`,
          body: htmlContent,
        });

        console.log('\n✅ Plunk API Response:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n✅ Newsletter sent successfully!`);
        console.log(`   Recipient: ${recipient}`);
        console.log(`   Message ID: ${result.messageId || result.id}`);

        return {
          success: true,
          messageId: result.messageId || result.id,
          recipient: recipient,
          articleCount: input.articles.length,
          date: newsletterDate,
          broadcast: false,
        };
      }
    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ PLUNK EMAIL TOOL - ERROR');
      console.error('='.repeat(60));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('API Response:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('='.repeat(60) + '\n');

      return {
        success: false,
        error: error.message,
        recipient: isBroadcast ? 'all contacts (broadcast)' : (input.recipientEmail || process.env.RECIPIENT_EMAIL),
      };
    }
  },
});

module.exports = { sendNewsletterTool };
