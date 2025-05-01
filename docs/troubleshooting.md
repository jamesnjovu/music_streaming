# Troubleshooting Guide

This guide covers common issues and their solutions when setting up and running the music streaming platform.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Module Import Issues](#module-import-issues)
- [Runtime Errors](#runtime-errors)
- [Docker Issues](#docker-issues)
- [Authentication Issues](#authentication-issues)
- [File Upload Issues](#file-upload-issues)

## Installation Issues

### Node.js or npm not found

**Symptom:** Commands like `npm install` fail with "command not found" errors.

**Solution:**
1. Install Node.js and npm from [https://nodejs.org/](https://nodejs.org/)
2. Ensure Node.js is at least version 14 or higher
3. Verify installation with:
   ```bash
   node --version
   npm --version
   ```

### Package installation errors

**Symptom:** `npm install` fails with dependency errors.

**Solution:**
1. Delete `node_modules` folder and `package-lock.json` file
2. Run `npm cache clean --force`
3. Try installing again with `npm install`
4. If a specific package fails, try installing it individually

## Database Issues

### Cannot connect to PostgreSQL

**Symptom:** The application fails to start with database connection errors.

**Solution:**
1. Ensure PostgreSQL is installed and running:
   ```bash
   # For Ubuntu/Debian
   sudo systemctl status postgresql
   
   # For macOS with Homebrew
   brew services list
   ```
2. Check credentials in `.env` file
3. Ensure database exists:
   ```bash
   psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='music_streaming_db';"
   ```
4. If it doesn't exist, create it:
   ```bash
   npm run db:create
   ```

### Schema synchronization fails

**Symptom:** `db:migrate` command fails with Sequelize errors.

**Solution:**
1. Check database credentials in `.env` file
2. Ensure database exists
3. For a fresh start, drop and recreate the database:
   ```bash
   psql -U postgres -c "DROP DATABASE IF EXISTS music_streaming_db;"
   npm run db:create
   npm run db:migrate
   ```

### Redis connection issues

**Symptom:** Application fails with Redis connection errors.

**Solution:**
1. Ensure Redis is installed and running:
   ```bash
   # For Ubuntu/Debian
   sudo systemctl status redis
   
   # For macOS with Homebrew
   brew services list
   ```
2. Check Redis configuration in `.env` file
3. Test Redis connection:
   ```bash
   redis-cli ping
   ```

## Module Import Issues

### Module not found errors

**Symptom:** Application fails to start with "Cannot find module" errors.

**Solution:**
1. Run the validation script to check for import issues:
   ```bash
   npm run validate
   ```
2. Fix any reported issues - typically path errors
3. Ensure all required packages are installed:
   ```bash
   npm install
   ```

### Sequelize model association errors

**Symptom:** Errors like "X.belongsTo is not a function" when starting the app.

**Solution:**
1. Check model associations in `src/models/index.js`
2. Ensure models are exported correctly
3. Verify correct import order (models must be defined before associations)

## Runtime Errors

### Application crashes on startup

**Symptom:** Node.js crashes immediately when starting the application.

**Solution:**
1. Check the log files in the `logs` directory
2. Run the module loading test to identify problematic modules:
   ```bash
   npm run test:load
   ```
3. Fix any reported issues in the identified modules

### API endpoints return 404

**Symptom:** Accessing API endpoints results in 404 Not Found errors.

**Solution:**
1. Ensure the server is running on the expected port
2. Check that routes are correctly defined and imported in `src/app.js`
3. Verify the URL path is correct (e.g., `/api/tracks` not `/tracks`)

## Docker Issues

### Docker containers won't start

**Symptom:** `docker-compose up` fails or containers exit immediately.

**Solution:**
1. Check Docker logs:
   ```bash
   docker-compose logs
   ```
2. Ensure ports are not already in use:
   ```bash
   # Check port 5000 (API)
   sudo lsof -i :5000
   # Check port 5432 (PostgreSQL)
   sudo lsof -i :5432
   # Check port 6379 (Redis)
   sudo lsof -i :6379
   ```
3. Ensure Docker daemon is running:
   ```bash
   docker info
   ```

### Cannot connect to services in Docker

**Symptom:** Application can't connect to PostgreSQL or Redis in Docker.

**Solution:**
1. Ensure services are running:
   ```bash
   docker-compose ps
   ```
2. Check container logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs redis
   ```
3. Verify network configuration in `docker-compose.yml`
4. Ensure the application is using the correct host names (`postgres` and `redis` for Docker)

## Authentication Issues

### JWT token issues

**Symptom:** Authentication fails with token-related errors.

**Solution:**
1. Ensure JWT secrets are correctly set in `.env`:
   ```
   JWT_SECRET=your_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_RESET_SECRET=your_reset_secret
   ```
2. Check token expiration settings
3. Verify that token is being sent in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```

### Login fails

**Symptom:** Login API returns 401 Unauthorized.

**Solution:**
1. Ensure user exists in the database
2. Check credentials (the default admin account is admin@example.com / admin123)
3. Verify bcrypt is working correctly for password hashing/comparison

## File Upload Issues

### Cannot upload files

**Symptom:** File uploads fail with errors.

**Solution:**
1. Ensure upload directories exist and have correct permissions:
   ```bash
   mkdir -p uploads/tracks uploads/covers
   chmod -R 777 uploads # For development only
   ```
2. Check maximum file size configuration in `.env` (default is 50MB)
3. Verify multer configuration in track controller

### Uploaded files not accessible

**Symptom:** Uploaded files return 404 when trying to access them.

**Solution:**
1. Check file paths in the database
2. Ensure the application is serving static files correctly:
   ```javascript
   // In src/app.js
   app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
   ```
3. Verify file permissions on the uploaded files