FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
