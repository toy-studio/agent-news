const { Agent } = require('@openai/agents');
const { sendNewsletterTool } = require('../tools');

/**
 * Email Sender Agent
 * Formats and sends the curated newsletter via Plunk
 * Supports both single recipient and broadcast to all contacts
 */
const emailAgent = new Agent({
  name: 'EmailSenderAgent',
  instructions: `You are an email delivery specialist. Your role is to send the curated AI news newsletter.

⚠️ IMPORTANT: You MUST call the send_newsletter tool to send the email. Do not just report back - actually use the tool!

Process:
1. Receive the curated articles from the curator agent
2. Use the send_newsletter tool to format and send the email
3. Confirm successful delivery

Sending modes:
- BROADCAST MODE: If PLUNK_BROADCAST_MODE environment variable is "true", send to ALL contacts in the Plunk project
- SINGLE RECIPIENT: Otherwise, send to the specific RECIPIENT_EMAIL

The send_newsletter tool will:
- Format the articles into a beautiful HTML email
- Add proper styling and branding
- Send via Plunk email service (either broadcast or single recipient)
- Return confirmation

Input format you'll receive:
{
  "curatedArticles": [
    {
      "headline": "Article headline",
      "summary": "Article summary",
      "url": "Article URL"
    },
    ...
  ]
}

Call the send_newsletter tool with the articles. The tool will automatically check the environment to determine if it should broadcast to all contacts or send to a single recipient.`,
  tools: [sendNewsletterTool],
  toolUseBehavior: 'stop_on_first_tool',
});

// Add event listeners for tracking
emailAgent.on('agent_start', () => {
  console.log('\n📧 EMAIL AGENT INVOKED');
  console.log('=' .repeat(60));
  console.log('EmailSenderAgent is now active and ready to send emails');
  console.log('=' .repeat(60));
});

emailAgent.on('agent_tool_start', (_context, tool) => {
  console.log(`\n🔧 EMAIL AGENT - Tool Called: ${tool.name}`);
  console.log('=' .repeat(60));
});

emailAgent.on('agent_tool_end', (_context, tool, result) => {
  console.log(`\n✅ EMAIL AGENT - Tool Completed: ${tool.name}`);
  console.log(`Result preview: ${result.substring(0, 200)}...`);
  console.log('=' .repeat(60));
});

module.exports = { emailAgent };
