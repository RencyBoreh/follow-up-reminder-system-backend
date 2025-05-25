const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

async function sendReminder(appointment) {
  const { patient_name, doctor_name, phone_number, appointment_date } = appointment;

  const message = `📅 Hello ${patient_name}, this is a reminder for your appointment with Dr. ${doctor_name} at ${new Date(appointment_date).toLocaleString()}.`;

  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM,
      to: `whatsapp:${phone_number}`
    });
    console.log(`✅ WhatsApp sent to ${phone_number}: SID ${res.sid}`);
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp to ${phone_number}:`, err.message);
  }
}

module.exports = { sendReminder };
