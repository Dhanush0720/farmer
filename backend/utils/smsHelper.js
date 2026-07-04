/**
 * Dispatch SMS alert to a farmer/trader
 * @param {string} phone - User phone number
 * @param {string} message - Text content
 */
const sendSMS = async (phone, message) => {
  console.log('\n==================================================');
  console.log('📱 [SMS GATEWAY DISPATCH SIMULATOR]');
  console.log(`➡️  TO: +91 ${phone}`);
  console.log(`💬  MESSAGE: "${message}"`);
  console.log('✅  STATUS: Delivered Successfully (Simulated)');
  console.log('==================================================\n');

  // Optional: Integration with real SMS Gateways
  
  // 1. Fast2SMS Integration (Popular Indian SMS Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.FAST2SMS_API_KEY
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          numbers: phone,
        })
      });
      console.log('💬 [Fast2SMS] Dispatched real SMS notification.');
    } catch (err) {
      console.error('❌ [Fast2SMS] Dispatch error:', err.message);
    }
  }

  // 2. Twilio Integration (Global Gateway)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${phone}`
      });
      console.log('💬 [Twilio] Dispatched real SMS notification.');
    } catch (err) {
      console.error('❌ [Twilio] Dispatch error:', err.message);
    }
  }
};

module.exports = { sendSMS };
