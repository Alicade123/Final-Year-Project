const { sendSMS } = require("../services/twilioService");

exports.notifyUser = async (req, res) => {
  const { phone, name, type } = req.body;

  if (!phone) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number required" });
  }

  const message = `Hi ${name}, your ${type} has been confirmed by Farmer TradeHub.`;

  await sendSMS(phone, message);

  res.status(200).json({ success: true, message: `SMS sent to ${phone}` });
};
