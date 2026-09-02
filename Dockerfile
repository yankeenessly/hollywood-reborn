# Use Node 24 Alpine for embedded SQLite DatabaseSync support
FROM node:24-alpine

WORKDIR /app

# Copy root and package files
COPY package.json ./
COPY server/package.json ./server/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install --prefix server
RUN npm install --prefix frontend

# Copy all source code
COPY . .

# Build frontend
RUN npm run build --prefix frontend

# Expose port
ENV PORT=5000
EXPOSE 5000

# Start production server
CMD ["node", "server/server.js"]
