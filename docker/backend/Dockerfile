FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/tracks uploads/covers

# Set permissions
RUN chmod -R 777 uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]