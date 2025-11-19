/**
 * Vercel Serverless Function for Email Subscription Confirmation
 * Subscribes a user after they click the confirmation link
 * Verifies the contact exists in Plunk before confirming
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  try {
    const { confirm } = req.query;

    // Validate contact ID
    if (!confirm) {
      return res.redirect('/?error=missing_contact_id');
    }

    // Check for Plunk API key
    if (!process.env.PLUNK_API_KEY) {
      console.error('PLUNK_API_KEY not set');
      return res.redirect('/?error=server_error');
    }

    console.log('📧 Verifying contact ID before confirming subscription:', confirm);

    // Get the contact by ID to verify it exists
    const getContactResponse = await fetch(`https://api.useplunk.com/v1/contacts/${encodeURIComponent(confirm)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
      },
    });

    const contactResponseText = await getContactResponse.text();

    if (!getContactResponse.ok) {
      // Contact doesn't exist - invalid ID
      console.error('❌ Contact not found in Plunk for ID:', confirm);
      return res.redirect('/?error=contact_not_found');
    }

    // Parse contact data
    let contactData;
    try {
      contactData = JSON.parse(contactResponseText);
    } catch (parseError) {
      console.error('Failed to parse contact response:', contactResponseText);
      return res.redirect('/?error=server_error');
    }

    const contactEmail = contactData.email;

    // Check if already subscribed
    if (contactData.subscribed === true) {
      console.log('ℹ️ Contact already subscribed:', contactEmail);
      return res.redirect(`/?confirm=${encodeURIComponent(contactEmail)}&already=true`);
    }

    console.log('✅ Contact verified, confirming subscription for:', contactEmail);

    // Subscribe the user via Plunk API using the contact ID
    const plunkResponse = await fetch('https://api.useplunk.com/v1/contacts/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
      },
      body: JSON.stringify({
        id: confirm,
      }),
    });

    // Parse response text first (can only read once)
    const responseText = await plunkResponse.text();

    if (!plunkResponse.ok) {
      let errorMessage = 'Failed to confirm subscription.';
      try {
        const plunkData = JSON.parse(responseText);
        console.error('Plunk API error:', plunkData);
        errorMessage = plunkData.error || plunkData.message || errorMessage;
      } catch (parseError) {
        console.error('Plunk API error (non-JSON):', responseText);
      }
      return res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
    }

    // Log response if available
    if (responseText) {
      try {
        const plunkData = JSON.parse(responseText);
        console.log('Plunk API response:', plunkData);
      } catch (parseError) {
        console.log('Plunk API returned non-JSON response:', responseText);
      }
    }

    console.log('✅ Subscription confirmed:', contactEmail);

    // Track subscription-confirmed event
    try {
      const trackResponse = await fetch('https://api.useplunk.com/v1/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
        },
        body: JSON.stringify({
          event: 'subscription-confirmed',
          email: contactEmail,
          subscribed: true,
        }),
      });

      if (trackResponse.ok) {
        console.log('✅ Subscription-confirmed event tracked for:', contactEmail);
      } else {
        console.warn('⚠️ Failed to track subscription-confirmed event');
      }
    } catch (trackError) {
      // Don't fail the confirmation if event tracking fails
      console.error('Failed to track subscription-confirmed event:', trackError);
    }

    // Redirect back to homepage with success parameter
    return res.redirect(`/?confirm=${encodeURIComponent(contactEmail)}`);

  } catch (error) {
    console.error('Confirmation error:', error);
    return res.redirect('/?error=unexpected_error');
  }
};

