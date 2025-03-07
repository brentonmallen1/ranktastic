
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create a directory for data persistence
RUN mkdir -p /data

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create volume for persistent data
VOLUME ["/data"]

# Expose port 80
EXPOSE 80

# Command to run the server
CMD ["nginx", "-g", "daemon off;"]
