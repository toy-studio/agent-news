/**
 * Vercel Serverless Function for AI News Newsletter
 * This endpoint is triggered by Vercel Cron at 8:00 AM UTC daily
 */

// Load environment variables
require('dotenv').config();

const { runDailyNewsWorkflow } = require('../workflows/dailyNewsWorkflow');

module.exports = async (req, res) => {
  console.log('⏰ Newsletter cron triggered at:', new Date().toISOString());

  // Verify this is a cron request or has proper authorization
  const authHeader = req.headers.authorization;

  // Allow Vercel Cron (sends CRON_SECRET as Bearer token) or manual trigger with auth
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTrigger = authHeader === `Bearer ${process.env.TRIGGER_SECRET}`;

  if (!isVercelCron && !isManualTrigger) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'This endpoint requires authorization'
    });
  }

  try {
    // Environment variables are already set via Vercel dashboard
    // But we can verify they exist
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set');
    }
    if (!process.env.PLUNK_API_KEY) {
      throw new Error('PLUNK_API_KEY not set');
    }

    const isBroadcast = process.env.PLUNK_BROADCAST_MODE === 'true';
    console.log(`📧 Mode: ${isBroadcast ? 'Broadcast to all contacts' : 'Single recipient'}`);

    // Run the workflow
    const result = await runDailyNewsWorkflow();

    if (result.success) {
      console.log('✅ Newsletter sent successfully');
      return res.status(200).json({
        success: true,
        message: 'Newsletter sent successfully',
        timestamp: new Date().toISOString(),
        ...result,
      });
    } else {
      console.error('❌ Newsletter failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};
