# Stage 1: Build the application
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Run the application
FROM node:14
WORKDIR /app
COPY --from=builder /app .
EXPOSE 5001
CMD ["node", "server.js"]
