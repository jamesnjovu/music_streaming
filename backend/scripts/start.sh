#!/bin/bash

# Music Streaming Platform Startup Script

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}  Music Streaming Platform Setup Tool  ${NC}"
echo -e "${YELLOW}=======================================${NC}"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js is installed:${NC} $NODE_VERSION"
else
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js 14 or higher.${NC}"
  exit 1
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓ npm is installed:${NC} $NPM_VERSION"
else
  echo -e "${RED}✗ npm is not installed. Please install npm.${NC}"
  exit 1
fi

# Check if Docker is running (only if we're going to use Docker)
if [ "$1" == "--docker" ]; then
  if command_exists docker; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
    if docker info >/dev/null 2>&1; then
      echo -e "${GREEN}✓ Docker daemon is running${NC}"
    else
      echo -e "${RED}✗ Docker daemon is not running. Please start Docker.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}✗ Docker is not installed. Please install Docker for containerized setup.${NC}"
    exit 1
  fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo -e "\n${YELLOW}Creating .env file from template...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}! Please review and update the values in .env file for your environment${NC}"
  else
    echo -e "${RED}✗ .env.example file not found. Cannot create .env file.${NC}"
    exit 1
  fi
else
  echo -e "\n${GREEN}✓ .env file already exists${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
  echo -e "${RED}✗ Failed to install dependencies${NC}"
  exit 1
fi

# Validate imports
echo -e "\n${YELLOW}Validating module imports...${NC}"
npm run validate
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ All module imports are valid${NC}"
else
  echo -e "${RED}✗ Found issues with module imports. Please fix them before continuing.${NC}"
  exit 1
fi

# Setup based on environment (Docker or local)
if [ "$1" == "--docker" ]; then
  echo -e "\n${YELLOW}Setting up Docker environment...${NC}"
  
  # Start Docker containers
  echo -e "${YELLOW}Starting Docker containers...${NC}"
  npm run docker:up
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker containers started successfully${NC}"
    sleep 5 # Give containers time to initialize
  else
    echo -e "${RED}✗ Failed to start Docker containers${NC}"
    exit 1
  fi
fi

# Database setup
echo -e "\n${YELLOW}Setting up database...${NC}"

# Create database
echo -e "${YELLOW}Creating database...${NC}"
npm run db:create
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database created successfully${NC}"
else
  echo -e "${RED}✗ Failed to create database${NC}"
  # Don't exit, as database might already exist
fi

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
npm run db:migrate
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database migrations completed successfully${NC}"
else
  echo -e "${RED}✗ Failed to run database migrations${NC}"
  exit 1
fi

# Seed database
echo -e "\n${YELLOW}Seeding database with initial data...${NC}"
npm run db:seed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
  echo -e "${RED}✗ Failed to seed database${NC}"
  exit 1
fi

# Create required directories if they don't exist
echo -e "\n${YELLOW}Creating upload directories...${NC}"
mkdir -p uploads/tracks uploads/covers
echo -e "${GREEN}✓ Upload directories created${NC}"

# Start the application
echo -e "\n${YELLOW}Starting the application...${NC}"
if [ "$2" == "--prod" ]; then
  npm start
else
  npm run dev
fi

# The script will keep running with the application until terminated