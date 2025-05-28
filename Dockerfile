# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
