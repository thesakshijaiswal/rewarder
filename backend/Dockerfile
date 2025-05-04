# backend/Dockerfile

# Use official Node.js LTS base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "./src/server.js"]