'use strict';

const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const queue = new Queue('tasks', { connection });

module.exports = queue;
