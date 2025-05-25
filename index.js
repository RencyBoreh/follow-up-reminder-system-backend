const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const supabase = require('./db');
const { sendReminder } = require('./utils/reminder');
require('dotenv').config();

const app = express();
app.use(cors({
  origin:'https://follow-upreminder-system-frontend.onrender.com',
  credentials:true
}));
app.use(express.json());

// Scheduled Task - every hour: send reminders for appointments within next 24 hours
cron.schedule('* * * * *', async () => {
  try {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) {
      console.error('❌ Error fetching appointments for reminders:', error);
      return;
    }
    if (!data || data.length === 0) {
      console.log('No appointments found for reminders.');
      return;
    }

    const now = new Date();
    const upcoming = data.filter(appt => {
      const apptTime = new Date(appt.appointment_date);
      const diffHours = (apptTime - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24; // appointments within next 24 hours
    });

    console.log(`Found ${upcoming.length} upcoming appointments to remind.`);

    for (const appt of upcoming) {
      await sendReminder(appt);
    }
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});
// Define the root route
app.get('/', (req, res) => {
  res.send('Server is running');
});
// Create Appointment
app.post('/appointment', async (req, res) => {
  console.log('Received form data:', req.body);
  const { doctor, patient, time, phone } = req.body;

  if ([doctor, patient, time, phone].some(val => !val || val.trim() === '')) {
    console.log('❌ One or more required fields are missing or empty.');
    console.log({ doctor, patient, time, phone });  // Log what was received
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      doctor_name: doctor,
      patient_name: patient,
      appointment_date: time,
      phone_number: phone
    }]);

  if (error) {
    console.error('❌ Supabase insert error:', error);
    return res.status(500).json({ error: 'Failed to insert into database' });
  }

  res.status(201).json({ message: 'Appointment created', data });
});

// Get Appointments
app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("appointments").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data); // ✅ Ensure `data` is an array
});

const PORT=5000;
app.listen(PORT,'0.0.0.0', () => console.log(`Server is running at http://localhost:${PORT}`));
