#!/usr/bin/env node

require('dotenv').config();
const { Client } = require('pg');
const logger = require('../src/utils/logger');

const dbName = process.env.DB_NAME || 'music_streaming_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

// Connect to postgres database to create our application database
const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: 'postgres' // Connect to default postgres database
});

logger.info(`Attempting to create database: ${dbName}`);

(async () => {
    try {
        // Connect to postgres
        await client.connect();

        // Check if database already exists
        const checkResult = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        if (checkResult.rowCount === 0) {
            // Database doesn't exist, create it
            await client.query(`CREATE DATABASE ${dbName}`);
            logger.info(`Database "${dbName}" created successfully`);
        } else {
            logger.info(`Database "${dbName}" already exists`);
        }

        // Close connection
        await client.end();
        process.exit(0);
    } catch (error) {
        logger.error('Error creating database:', error);

        // Try to close connection
        try {
            await client.end();
        } catch (endError) {
            logger.error('Error closing client connection:', endError);
        }

        process.exit(1);
    }
})();