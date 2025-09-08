'use strict';

const cron = require('node-cron');
const queue = require('./queue');

// Schedule a task to run every minute.
cron.schedule('* * * * *', async () => {
  console.log('Scheduler: Running scheduled tasks...');

  // Example of queueing a job to settle a mission.
  // In a real application, you would fetch missions from your database/smart contract
  // that are ready to be settled.
  const missionId = 'mission_123'; // Example mission ID
  await queue.add('settle-mission', { missionId });
  console.log(`Scheduler: Queued job to settle mission ${missionId}`);


  // Example of queueing a job to send a reminder.
  const userId = 'user_abc'; // Example user ID
  const message = 'Your deposit is due in 24 hours!';
  await queue.add('send-reminder', { userId, message });
  console.log(`Scheduler: Queued job to send reminder to user ${userId}`);
});

console.log('Scheduler started.');
