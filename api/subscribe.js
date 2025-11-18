/**
 * Vercel Serverless Function for Newsletter Subscriptions
 * Adds new subscribers to Plunk contact list
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address',
      });
    }

    // Check for Plunk API key
    if (!process.env.PLUNK_API_KEY) {
      console.error('PLUNK_API_KEY not set');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    console.log('📧 New subscription request:', email);

    // Add contact to Plunk
    const plunkResponse = await fetch('https://api.useplunk.com/v1/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        subscribed: true,
        data: {
          source: 'website',
          subscribedAt: new Date().toISOString(),
        },
      }),
    });

    const plunkData = await plunkResponse.json();

    if (!plunkResponse.ok) {
      console.error('Plunk API error:', plunkData);

      // Handle duplicate email gracefully
      if (plunkResponse.status === 400 && plunkData.error?.includes('already exists')) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed!',
          alreadySubscribed: true,
        });
      }

      return res.status(plunkResponse.status).json({
        success: false,
        error: 'Failed to subscribe. Please try again.',
      });
    }

    console.log('✅ Subscription successful:', email);

    // Optional: Send welcome email
    try {
      await sendWelcomeEmail(email);
    } catch (welcomeError) {
      console.error('Failed to send welcome email:', welcomeError);
      // Don't fail the subscription if welcome email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed! Check your email.',
      contact: {
        id: plunkData.id,
        email: email,
      },
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

/**
 * Send welcome email to new subscriber
 */
async function sendWelcomeEmail(email) {
  const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Welcome to AI News Daily! 🎉</h1>

  <p>Thanks for subscribing! You'll receive your first newsletter tomorrow morning.</p>

  <h2>What to expect:</h2>
  <ul>
    <li>📰 Top 10 AI news stories every day</li>
    <li>🤖 Curated by autonomous AI agents</li>
    <li>⚡ Real-time web search for the latest news</li>
    <li>✨ Clear summaries that explain why it matters</li>
  </ul>

  <p>Your newsletter will arrive at 8:00 AM UTC daily.</p>

  <p>Have feedback? Just reply to any newsletter email!</p>

  <hr>

  <p style="font-size: 12px; color: #666;">
    You're receiving this because you subscribed at ai-newsletter-rho.vercel.app<br>
    Don't want these emails? You can unsubscribe anytime by clicking the link in any newsletter.
  </p>
</body>
</html>
  `;

  const response = await fetch('https://api.useplunk.com/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
    },
    body: JSON.stringify({
      to: email,
      subject: '🤖 Welcome to AI News Daily!',
      body: welcomeHtml,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send welcome email: ${error}`);
  }

  console.log('✅ Welcome email sent to:', email);
}
