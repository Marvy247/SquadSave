'use strict';

require('dotenv').config();
const { Worker } = require('bullmq');
const line = require('@line/bot-sdk');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

// create LINE SDK client
const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
});

const worker = new Worker('tasks', async job => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  console.log('Job data:', job.data);

  switch (job.name) {
    case 'handle-line-event':
      const { event } = job.data;
      if (event.type === 'follow') {
        console.log(`Worker: Handling follow event for user ${event.source.userId}`);
        // TODO: Add user to database
      } else if (event.type === 'join') {
        console.log(`Worker: Handling join event for group/chat ${event.source.groupId || event.source.chatId}`);
        // TODO: Add group/chat to database
      } else if (event.type === 'message' && event.message.type === 'text') {
        console.log(`Worker: Handling message from user ${event.source.userId}: ${event.message.text}`);
        // TODO: Process message, e.g., check for commands
        // For now, we'll just echo the message back
        const echo = { type: 'text', text: `You said: ${event.message.text}` };
        return client.replyMessage(event.replyToken, echo);
      }
      break;
    case 'settle-mission':
      const { missionId } = job.data;
      console.log(`Worker: Settling mission ${missionId}`);
      // TODO: Call smart contract to settle mission
      break;
    case 'send-reminder':
        const { userId, message } = job.data;
        console.log(`Worker: Sending reminder to user ${userId}`);
        // TODO: Send reminder message via LINE
        break;
    default:
      console.log(`Unknown job type: ${job.name}`);
  }
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Worker started.');
