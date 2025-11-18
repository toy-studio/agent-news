/**
 * Cloudflare Worker for AI News Newsletter
 * Scheduled to run daily at 8:00 AM UTC
 */

const { runDailyNewsWorkflow } = require('./workflows/dailyNewsWorkflow');

/**
 * Scheduled handler - triggered by cron
 */
export default {
  async scheduled(event, env, ctx) {
    console.log('⏰ Cron trigger activated at:', new Date().toISOString());

    // Set environment variables from Cloudflare Worker env
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
    process.env.PLUNK_API_KEY = env.PLUNK_API_KEY;
    process.env.PLUNK_BROADCAST_MODE = env.PLUNK_BROADCAST_MODE || 'false';
    process.env.RECIPIENT_EMAIL = env.RECIPIENT_EMAIL || '';

    const isBroadcast = process.env.PLUNK_BROADCAST_MODE === 'true';
    console.log(`📧 Mode: ${isBroadcast ? 'Broadcast to all contacts' : 'Single recipient'}`);

    try {
      const result = await runDailyNewsWorkflow();

      if (result.success) {
        console.log('✅ Newsletter sent successfully');
      } else {
        console.error('❌ Newsletter failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Fatal error in scheduled job:', error);
      throw error;
    }
  },

  /**
   * HTTP handler - for manual triggers via URL
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Manual trigger endpoint (with simple auth)
    if (url.pathname === '/trigger') {
      const authHeader = request.headers.get('Authorization');
      const expectedAuth = `Bearer ${env.TRIGGER_SECRET || 'your-secret-key'}`;

      if (authHeader !== expectedAuth) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Set environment variables
      process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
      process.env.PLUNK_API_KEY = env.PLUNK_API_KEY;
      process.env.PLUNK_BROADCAST_MODE = env.PLUNK_BROADCAST_MODE || 'false';
      process.env.RECIPIENT_EMAIL = env.RECIPIENT_EMAIL || '';

      try {
        const result = await runDailyNewsWorkflow();

        return new Response(JSON.stringify(result, null, 2), {
          headers: { 'Content-Type': 'application/json' },
          status: result.success ? 200 : 500,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    return new Response('AI News Newsletter Worker\n\nEndpoints:\n- /health - Health check\n- /trigger - Manual trigger (requires auth)', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
