/**
 * Health check endpoint for Vercel deployment
 */

module.exports = async (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasPlunkKey: !!process.env.PLUNK_API_KEY,
    broadcastMode: process.env.PLUNK_BROADCAST_MODE === 'true',
  });
};
