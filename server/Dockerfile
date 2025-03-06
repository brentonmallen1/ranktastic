
FROM node:18-alpine

WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Add initialization script
COPY init-db.sh /app/
RUN chmod +x /app/init-db.sh

# Expose the port the app runs on
EXPOSE 3001

# Run the initialization script and start the application
CMD ["/bin/sh", "-c", "/app/init-db.sh && node index.js"]
