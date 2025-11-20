# ZeroBitOne Dashboard - Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (better-sqlite3 has prebuilt binaries for alpine)
RUN npm ci --only=production --ignore-scripts || npm install --only=production

# Copy application files
COPY server ./server
COPY public ./public
COPY .env.example .env

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000', (r) => { if (r.statusCode !== 200) throw new Error(); })"

# Start the application
CMD ["node", "server/index.js"]
