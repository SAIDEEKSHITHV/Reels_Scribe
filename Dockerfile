FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev

# Copy rest of the code
COPY . .

# Expose port (Render uses PORT env)
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
