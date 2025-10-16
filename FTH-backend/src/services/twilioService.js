// services/twilioService.js
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to, // e.g. '+250782583016'
    });
    console.log("✅ SMS sent successfully:", response.sid);
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.message);
  }
};
