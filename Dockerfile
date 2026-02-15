### --------- FRONTEND BUILD STAGE ---------
FROM node:18-alpine AS build
WORKDIR /src

# Copy root package files
COPY package.json package-lock.json ./

# Force development mode so devDependencies (vite, postcss, tailwindcss) are installed
ENV NODE_ENV=development
RUN npm ci --no-audit --no-fund

# Install rollup binary for Alpine Linux (musl) — lockfile was generated on Windows
RUN npm i @rollup/rollup-linux-x64-musl --no-save

# Verify vite is present before building
RUN ls node_modules/vite/bin/vite.js

# Copy frontend source
COPY frontend ./frontend

# Allow passing API base during build
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

# Build frontend
RUN cd frontend && node ../node_modules/vite/bin/vite.js build


### --------- BACKEND RUNTIME STAGE ---------
FROM node:18-alpine AS runtime
WORKDIR /app/backend

# Install only production deps for runtime
COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --production --no-audit --no-fund

# Copy backend code
COPY backend/ .

# Copy built frontend from correct path
COPY --from=build /src/frontend/dist ./dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]