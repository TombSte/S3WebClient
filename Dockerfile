# syntax=docker/dockerfile:1

########################################
# Build stage: compile Vite React app  #
########################################
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY S3WebClient/package*.json ./
RUN npm ci

# Copy the rest of the app and build
# Optionally include env files (e.g., .env.production) if present
COPY S3WebClient/.env* ./
COPY S3WebClient/ ./
# Build-time config: create S3WebClient/.env.production with VITE_* vars
# Example:
#   VITE_API_BASE_URL=https://api.example.com
#   VITE_FEATURE_FLAG=true
# Vite automatically loads .env.production for `npm run build`.
RUN npm run build

########################################
# Runtime stage: serve static files    #
########################################
FROM nginx:stable-alpine AS runtime

# Replace default config with SPA-friendly one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Basic healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ || exit 1

# nginx image defines the default CMD
