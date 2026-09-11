FROM node:20-slim

WORKDIR /app

# Install ffmpeg (needed for audio extraction)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Uploads directory
RUN mkdir -p /uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
