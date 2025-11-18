const { tool } = require('@openai/agents');
const { z } = require('zod');
const Plunk = require('@plunk/node').default;
// Using native fetch (Node 18+)

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
    broadcastToAll: z.boolean().default(false).describe('If true, broadcast to all contacts in Plunk project using Campaigns API. If false, send to recipientEmail.'),
    recipientEmail: z.string().email().default('').describe('Email address to send the newsletter to (only used if broadcastToAll is false, defaults to RECIPIENT_EMAIL env var)'),
    date: z.string().default('').describe('Date for the newsletter (defaults to today)'),
  }),
  execute: async (input) => {
    try {
      // Check if Plunk API key is set
      if (!process.env.PLUNK_API_KEY) {
        throw new Error('PLUNK_API_KEY environment variable is not set');
      }

      console.log('🔑 Plunk API Key found:', process.env.PLUNK_API_KEY.substring(0, 10) + '...');

      const plunk = new Plunk(process.env.PLUNK_API_KEY);

      const newsletterDate = (input.date && input.date !== '') ? input.date : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Determine broadcast mode
      const isBroadcast = input.broadcastToAll || process.env.PLUNK_BROADCAST_MODE === 'true';

      console.log('\n' + '='.repeat(60));
      console.log('📧 PLUNK EMAIL TOOL - STARTING');
      console.log('='.repeat(60));
      console.log(`Mode: ${isBroadcast ? 'BROADCAST' : 'SINGLE RECIPIENT'}`);
      console.log(`Articles received: ${input.articles.length}`);
      console.log(`Newsletter date: ${newsletterDate}`);

      if (!isBroadcast) {
        // Get recipient email for single-recipient mode
        const recipient = (input.recipientEmail && input.recipientEmail !== '') ? input.recipientEmail : process.env.RECIPIENT_EMAIL;
        if (!recipient) {
          throw new Error('No recipient email specified and RECIPIENT_EMAIL not set in environment');
        }
        console.log(`📧 Sending to: ${recipient}`);
      } else {
        console.log(`📧 Broadcasting to all contacts in Plunk project`);
      }

      console.log('\n📰 Articles to be sent:');
      input.articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.headline}`);
        console.log(`     URL: ${article.url}`);
        console.log(`     Summary: ${article.summary.substring(0, 100)}...`);
      });
      console.log('='.repeat(60) + '\n');

      // Create simple HTML email content
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Jonny's AI Newsletter</h1>
  <p>${newsletterDate}</p>

  ${input.articles.map((article, index) => `
  <h2>${index + 1}. <a href="${article.url}">${article.headline}</a></h2>
  <p>${article.summary}</p>
  <p><a href="${article.url}">Read more →</a></p>
  <hr>
  `).join('')}

  <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
    This newsletter was curated by AI agents<br>
    <a href="%%unsubscribe%%" style="color: #999; text-decoration: underline;">Unsubscribe</a>
  </p>
</body>
</html>
      `;

      // Send email via Plunk
      console.log('📤 Sending email via Plunk API...\n');

      if (isBroadcast) {
        // BROADCAST MODE: Use Campaigns API via direct HTTP calls
        console.log('🔧 Step 1: Creating Plunk Campaign via HTTP API');
        console.log(`   POST https://api.useplunk.com/v1/campaigns`);
        console.log(`   name: "AI News Daily - ${newsletterDate}"`);
        console.log(`   subject: "🤖 AI News Daily - ${newsletterDate}"`);
        console.log(`   body: HTML content (${htmlContent.length} characters)`);
        console.log(`   recipients: [] (send to all contacts)`);

        // Create campaign
        const createResponse = await fetch('https://api.useplunk.com/v1/campaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
          },
          body: JSON.stringify({
            name: `AI News Daily - ${newsletterDate}`,
            subject: `🤖 AI News Daily - ${newsletterDate}`,
            body: htmlContent,
            recipients: [], // Empty array means all contacts
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create campaign: ${createResponse.status} ${createResponse.statusText} - ${errorText}`);
        }

        const campaign = await createResponse.json();
        console.log('\n✅ Campaign Created:');
        console.log(JSON.stringify(campaign, null, 2));
        console.log(`   Campaign ID: ${campaign.id}`);

        // Send campaign
        console.log('\n🔧 Step 2: Sending Campaign to All Contacts');
        console.log(`   POST https://api.useplunk.com/v1/campaigns/send`);
        console.log(`   Campaign ID: ${campaign.id}`);

        const sendResponse = await fetch(`https://api.useplunk.com/v1/campaigns/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
          },
          body: JSON.stringify({
            id: campaign.id,
            delay: 0, // Send immediately (no delay)
          }),
        });

        if (!sendResponse.ok) {
          const errorText = await sendResponse.text();
          throw new Error(`Failed to send campaign: ${sendResponse.status} ${sendResponse.statusText} - ${errorText}`);
        }

        const sendResult = await sendResponse.json();
        console.log('\n✅ Campaign Sent Successfully:');
        console.log(JSON.stringify(sendResult, null, 2));
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
        // SINGLE RECIPIENT MODE: Use emails.send
        const recipient = (input.recipientEmail && input.recipientEmail !== '') ? input.recipientEmail : process.env.RECIPIENT_EMAIL;

        console.log('🔧 Plunk API Call Details:');
        console.log(`   to: "${recipient}"`);
        console.log(`   subject: "🤖 AI News Daily - ${newsletterDate}"`);
        console.log(`   body: HTML content (${htmlContent.length} characters)`);

        const result = await plunk.emails.send({
          to: recipient,
          subject: `🤖 AI News Daily - ${newsletterDate}`,
          body: htmlContent,
        });

        console.log('\n✅ Plunk API Response:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n✅ Newsletter sent successfully!`);
        console.log(`   Recipient: ${recipient}`);
        console.log(`   Message ID: ${result.messageId || result.id || 'N/A'}`);

        return {
          success: true,
          messageId: result.messageId || result.id || 'N/A',
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

      const isBroadcast = input.broadcastToAll || process.env.PLUNK_BROADCAST_MODE === 'true';
      const recipient = isBroadcast
        ? 'all contacts (broadcast)'
        : ((input.recipientEmail && input.recipientEmail !== '') ? input.recipientEmail : process.env.RECIPIENT_EMAIL || 'unknown');

      return {
        success: false,
        error: error.message,
        recipient: recipient,
        broadcast: isBroadcast,
      };
    }
  },
});

module.exports = { sendNewsletterTool };
