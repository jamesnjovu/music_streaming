#!/usr/bin/env node

/**
 * This script attempts to require all project modules to see if they load correctly
 * without any syntax errors or missing dependencies.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));

// Set up logger
const logger = {
  info: (msg) => console.log(`\x1b[32m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
};

// Modules that we should skip
const skipModules = [
  'src/server.js',  // This would start the server
  'src/app.js',     // This would set up Express (depends on routes)
];

async function testModuleLoading() {
  logger.info('Starting module loading test...');
  
  // Find all JavaScript files in src
  const files = await glob('src/**/*.js');
  let failedModules = 0;
  let loadedModules = 0;
  
  // Sort files to load utils first, then models, then services, etc.
  const sortedFiles = files.sort((a, b) => {
    const aPriority = getFilePriority(a);
    const bPriority = getFilePriority(b);
    return aPriority - bPriority;
  });
  
  // Try to require each file
  for (const file of sortedFiles) {
    // Skip modules that would start the server or depend on all routes
    if (skipModules.some(skipModule => file.includes(skipModule))) {
      logger.info(`Skipping ${file} (would start server or has circular dependencies)`);
      continue;
    }
    
    try {
      // Get the absolute path
      const absolutePath = path.resolve(file);
      
      // Require the module
      logger.info(`Loading ${file}...`);
      require(absolutePath);
      
      logger.success(`Successfully loaded ${file}`);
      loadedModules++;
    } catch (error) {
      logger.error(`Failed to load ${file}: ${error.message}`);
      console.error(error);
      failedModules++;
    }
  }
  
  if (failedModules === 0) {
    logger.info(`All ${loadedModules} modules loaded successfully!`);
    return true;
  } else {
    logger.warn(`Failed to load ${failedModules} out of ${loadedModules + failedModules} modules.`);
    return false;
  }
}

// Helper function to assign priority to files based on their path
function getFilePriority(filePath) {
  if (filePath.includes('/utils/')) return 1;
  if (filePath.includes('/config/')) return 2;
  if (filePath.includes('/middlewares/')) return 3;
  if (filePath.includes('/models/')) return 4;
  if (filePath.includes('/services/')) return 5;
  if (filePath.includes('/api/')) return 6;
  return 10; // Default priority
}

testModuleLoading()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('Test failed:', error);
    process.exit(1);
  });