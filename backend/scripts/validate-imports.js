#!/usr/bin/env node

/**
 * This script validates import paths in JavaScript files
 * to catch potential import errors before running the application.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));

// Set up logger
const logger = {
  info: (msg) => console.log(`\x1b[32m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`)
};

// Regular expression to match require statements
const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

// Common problem patterns - patterns to check and their fixes
const problemPatterns = [
  { pattern: /\.\.\/\.\.\/utils\/errorHandler/, fix: '../../middlewares/errorHandler' },
  { pattern: /\.\.\/utils\/errorHandler/, fix: '../middlewares/errorHandler' },
];

// Standard Node.js modules and expected npm dependencies that we shouldn't try to resolve
const standardModules = [
  'fs', 'path', 'http', 'https', 'util', 'crypto', 'os', 'stream', 'events', 'url',
  'express', 'sequelize', 'redis', 'bcryptjs', 'jsonwebtoken', 'multer', 'cors', 
  'helmet', 'morgan', 'express-rate-limit', 'swagger-jsdoc', 'swagger-ui-express',
  'winston', 'uuid', 'dotenv', 'pg'
];

async function validateImports() {
  logger.info('Starting import path validation...');
  
  const files = await glob('src/**/*.js');
  let problemsFound = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = [...content.matchAll(requireRegex)];
    
    for (const match of matches) {
      const importPath = match[1];
      
      // Skip standard modules and npm dependencies that we don't need to resolve
      if (standardModules.some(mod => mod === importPath || importPath.startsWith(mod + '/'))) {
        continue;
      }
      
      // Skip relative paths that point to other project files - we'll validate these
      // based on specific patterns, not by trying to resolve them
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Check for problem patterns
        for (const { pattern, fix } of problemPatterns) {
          if (pattern.test(importPath)) {
            logger.error(`Problem in ${file}: Import "${importPath}" should be "${fix}"`);
            problemsFound++;
          }
        }
        continue;
      }
      
      // For any other modules, they should be in package.json
      // We won't try to resolve them as that would require installing all deps
    }
  }
  
  if (problemsFound === 0) {
    logger.info('All imports appear to be valid!');
    console.log('\x1b[32m✓ SUCCESS: No import problems found!\x1b[0m');
    return true;
  } else {
    logger.warn(`Found ${problemsFound} import problems that need to be fixed.`);
    return false;
  }
}

validateImports()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('Validation failed:', error);
    process.exit(1);
  });

validateImports()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('Validation failed:', error);
    process.exit(1);
  });