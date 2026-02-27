# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development)
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]