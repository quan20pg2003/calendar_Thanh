# Stage 1: Build Frontend App (React + Vite)
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy root package files & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Production Server (Node.js Express API & Static Server)
FROM node:20-alpine AS production-stage
WORKDIR /app

# Copy built frontend assets
COPY --from=build-stage /app/dist ./dist

# Copy backend server files
COPY server ./server

# Install backend dependencies
WORKDIR /app/server
RUN npm install --production

# Create persistent storage directory for SQLite Database
VOLUME ["/app/server"]

# Expose Server Port
EXPOSE 3001

# Start Production Application Server
CMD ["node", "index.js"]
