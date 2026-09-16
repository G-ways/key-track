# ---------- Stage 1: Build React frontend ----------
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Build & run Express backend ----------
FROM node:20-alpine
WORKDIR /app

# Install backend deps
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server/ ./

# Copy React build output into a folder Express can serve
COPY --from=client-build /app/client/build ./public

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "index.js"]