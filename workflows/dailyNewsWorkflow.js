const { run } = require('@openai/agents');
const { controllerAgent } = require('../agents');
require('dotenv').config();

/**
 * Daily AI News Newsletter Workflow
 * Orchestrates the entire newsletter generation process
 */
async function runDailyNewsWorkflow() {
  try {
    console.log('🚀 Starting daily AI news newsletter workflow...');
    console.log(`📅 Date: ${new Date().toLocaleString()}\n`);

    const recipientEmail = process.env.RECIPIENT_EMAIL;

    if (!recipientEmail) {
      throw new Error('RECIPIENT_EMAIL environment variable is not set');
    }

    // Run the controller agent which will orchestrate the entire workflow
    console.log('🎯 Starting controller agent...');
    console.log(`📋 Broadcast Mode: ${process.env.PLUNK_BROADCAST_MODE}`);
    console.log(`📋 Recipient Email: ${recipientEmail}\n`);

    const result = await run(
      controllerAgent,
      `Generate and send today's AI news newsletter to ${recipientEmail}.

      Follow the complete workflow:
      1. Find the latest AI news from the past 24 hours
      2. Read and curate the top 10 most important stories
      3. Send the formatted newsletter email

      Please complete all steps.`
    );

    console.log('\n' + '='.repeat(60));
    console.log('✅ Newsletter workflow completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📧 Result object:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📧 Final output:', result.finalOutput);

    return {
      success: true,
      output: result.finalOutput,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('\n❌ Newsletter workflow failed:', error.message);
    console.error('Stack trace:', error.stack);

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export for use in Cloudflare Worker
module.exports = { runDailyNewsWorkflow };

// Allow running directly for testing
if (require.main === module) {
  runDailyNewsWorkflow()
    .then((result) => {
      console.log('\n📊 Workflow result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
