#!/usr/bin/env node

require('dotenv').config();
const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

logger.info('Starting database migration');

const args = process.argv.slice(2);
const forceSync = args.includes('--force');

if (forceSync) {
    logger.warn('Force sync enabled - this will drop all tables and recreate them');
}

// Run the migration
(async () => {
    try {
        // Sync the database schema
        await sequelize.sync({ force: forceSync, alter: !forceSync });

        logger.info('Database migration completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Database migration error:', error);
        process.exit(1);
    }
})();