// setup.js
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'staging'}` });

const app = require('../../src/app');

module.exports = app;
