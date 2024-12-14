# Use specific version and lighter base image
FROM node:20-alpine

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directory and set ownership
WORKDIR /usr/src/app

# Create directories as root and set ownership immediately
RUN mkdir -p /usr/src/app/db /usr/src/app/data && \
    chown -R appuser:appgroup /usr/src/app && \
    chmod 755 /usr/src/app/db /usr/src/app/data

# Copy package files
COPY --chown=appuser:appgroup package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code with correct ownership
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Command to run the application
CMD [ "node", "server.js" ]