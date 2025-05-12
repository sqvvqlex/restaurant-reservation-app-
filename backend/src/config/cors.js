const config = require('./index');

// CORS options
module.exports = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19006'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200
};
