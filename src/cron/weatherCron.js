const cron = require('node-cron');
const axios = require('axios');

// This cron job will hit the /api/send-alert endpoint every hour.
// In a real production environment, you might want to secure this endpoint.
cron.schedule('0 * * * *', async () => {
  console.log('Running weather check cron job...');
  try {
    // Replace with your actual production URL
    await axios.get('http://localhost:3000/api/send-alert'); 
    console.log('Successfully triggered send-alert endpoint.');
  } catch (error) {
    console.error('Failed to trigger send-alert endpoint:', error.message);
  }
});

console.log('Cron job for weather alerts has been scheduled.');
