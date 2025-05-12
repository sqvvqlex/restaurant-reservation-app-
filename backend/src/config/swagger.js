const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const config = require('./index');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Restaurant Reservation API',
            version: '1.0.0',
            description: 'API documentation for Restaurant Reservation System'
        },
        servers: [
            { url: `http://localhost:${config.port || 3008}` }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Book: {
                    type: 'object',
                    properties: {
                        uuid: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        author: { type: 'string' },
                        published_year: { type: 'integer' },
                        genre: { type: 'string' }
                    },
                    example: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        title: "The Great Gatsby",
                        author: "F. Scott Fitzgerald",
                        published_year: 1925,
                        genre: "Fiction"
                    }
                },
                BookInput: {
                    type: 'object',
                    required: ['title', 'author', 'published_year', 'genre'],
                    properties: {
                        title: { type: 'string' },
                        author: { type: 'string' },
                        published_year: { type: 'integer' },
                        genre: { type: 'string' }
                    },
                    example: {
                        title: "1984",
                        author: "George Orwell",
                        published_year: 1949,
                        genre: "Dystopian"
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
