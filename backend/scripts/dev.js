#!/usr/bin/env node

/**
 * This script runs the application in development mode using nodemon
 * It also watches for changes to restart the server automatically
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const logger = require('../src/utils/logger');

// Check if nodemon is installed
try {
  require.resolve('nodemon');
} catch (err) {
  console.error('Nodemon is not installed. Please install it using "npm install nodemon --save-dev"');
  process.exit(1);
}

// Get nodemon binary path
const nodemonBinPath = path.join(__dirname, '../node_modules/.bin/nodemon');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const tracksDirPath = path.join(uploadsDir, 'tracks');
const coversDirPath = path.join(uploadsDir, 'covers');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(tracksDirPath)) {
  fs.mkdirSync(tracksDirPath, { recursive: true });
}

if (!fs.existsSync(coversDirPath)) {
  fs.mkdirSync(coversDirPath, { recursive: true });
}

// Run nodemon
console.log('Starting development server with nodemon...');
const serverProcess = spawn(nodemonBinPath, ['server.js'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

// Handle process exit
serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Development server exited with code ${code}`);
  } else {
    console.log('Development server stopped');
  }
  process.exit(code);
});

// Handle termination signals
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal} signal, shutting down development server...`);
    serverProcess.kill(signal);
  });
});

console.log('Development server started. Press Ctrl+C to stop.');
console.log('API available at http://localhost:5000');
console.log('API docs available at http://localhost:5000/api-docs');