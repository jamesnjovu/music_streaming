#!/usr/bin/env node

require('dotenv').config();
const seedDatabase = require('../src/utils/seedDatabase');
const logger = require('../src/utils/logger');

logger.info('Starting database seeding process');

seedDatabase()
.then(success => {
    if (success) {
        logger.info('Database seeding completed successfully');
        process.exit(0);
    } else {
        logger.error('Database seeding failed');
        process.exit(1);
    }
})
.catch(error => {
    logger.error('Database seeding error:', error);
    process.exit(1);
});