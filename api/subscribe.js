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

    // Track event in Plunk to trigger confirmation email (creates contact if doesn't exist)
    const plunkResponse = await fetch('https://api.useplunk.com/v1/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
      },
      body: JSON.stringify({
        event: 'subscribed',
        email: email,
        subscribed: false,
      }),
    });

    // Parse response text first (can only read once)
    const responseText = await plunkResponse.text();

    if (!plunkResponse.ok) {
      let errorMessage = 'Failed to process subscription. Please try again.';
      try {
        const plunkData = JSON.parse(responseText);
        console.error('Plunk API error:', plunkData);
        errorMessage = plunkData.error || plunkData.message || errorMessage;
      } catch (parseError) {
        console.error('Plunk API error (non-JSON):', responseText);
      }
      return res.status(plunkResponse.status).json({
        success: false,
        error: errorMessage,
      });
    }

    // Get the contact to retrieve the ID
    const getContactResponse = await fetch(`https://api.useplunk.com/v1/contacts/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
      },
    });

    const contactResponseText = await getContactResponse.text();
    let contactId = null;

    if (getContactResponse.ok) {
      try {
        const contactData = JSON.parse(contactResponseText);
        contactId = contactData.id;
        console.log('✅ Contact ID retrieved:', contactId);
      } catch (parseError) {
        console.error('Failed to parse contact response:', contactResponseText);
      }
    } else {
      console.warn('Could not retrieve contact ID, but event was tracked');
    }

    console.log('✅ Subscription event tracked, confirmation email will be sent:', email);

    return res.status(200).json({
      success: true,
      message: 'Please check your email to confirm your subscription.',
      contactId: contactId, // Include for testing/debugging
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

