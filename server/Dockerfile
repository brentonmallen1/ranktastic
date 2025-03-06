
FROM node:18-alpine

WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Run the application
CMD ["node", "index.js"]
