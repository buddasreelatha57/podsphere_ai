FROM node:20-slim AS builder

WORKDIR /app

# Install ffmpeg (needed for audio extraction)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies (including devDeps for tsc)
COPY package*.json ./
RUN npm install

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ─────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install ffmpeg in the final image too (runtime needs it)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy only production node_modules and compiled output
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Uploads directory
RUN mkdir -p /uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
