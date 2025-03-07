
FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck and debugging
RUN apk --no-cache add curl

# Create data directory for SQLite with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy application code
COPY . .

# Debug: Print file structure and environment
RUN ls -la /app && echo "Contents of server directory:" && ls -la /app

# Set proper permissions for the initialization script
RUN chmod +x /app/init-db.sh

# Print directory structure for debugging
RUN echo "Server directory structure:" && ls -la /app

# Additional debugging commands to ensure services are working
RUN echo "Testing node functionality:" && node -v && npm -v

# Expose the port the app runs on
EXPOSE 3001

# Add health check endpoint as a file for direct testing
RUN echo '{"status":"ok","component":"server"}' > /app/health.json

# Run the initialization script which starts the application
CMD ["/bin/sh", "-c", "echo 'Starting backend server...' && /app/init-db.sh"]
