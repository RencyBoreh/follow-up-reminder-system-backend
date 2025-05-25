const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/', async (req, res) => {
  const {doctor_name,patient_name,phone_number, appointment_date } = req.body;

  const { data, error } = await supabase.from('appointments').insert([
    {
      doctor_name,
      patient_name,
      phone_number,
      appointment_date,
    }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Appointment saved successfully', data });
});

module.exports = router;
