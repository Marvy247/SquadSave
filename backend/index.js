'use strict';

require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const queue = require('./queue');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// create Express app
const app = express();

// register a webhook handler with middleware
app.post('/webhook/line', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  await queue.add('handle-line-event', { event });
  return Promise.resolve(null);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
