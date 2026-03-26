# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:22.22.2-alpine AS builder

# Upgrade OS packages to fix upstream vulnerabilities (Snyk-detected)
RUN apk update && apk upgrade --no-cache

# Upgrade npm to fix high-severity vulnerabilities (glob, minimatch, tar)
RUN npm install -g npm@11.6.4

WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (including devDeps for build)
RUN npm ci --no-audit --no-fund || npm ci --no-audit --no-fund || npm ci --no-audit --no-fund

COPY . .

# Build for production
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:22.22.2-alpine AS production

# Upgrade OS packages to fix upstream vulnerabilities (Snyk-detected)
RUN apk update && apk upgrade --no-cache

# Upgrade npm to fix high-severity vulnerabilities
RUN npm install -g npm@11.6.4

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production --ignore-scripts --no-audit --no-fund || npm ci --only=production --ignore-scripts --no-audit --no-fund || npm ci --only=production --ignore-scripts --no-audit --no-fund

# Copy built artifacts from builder

COPY --from=builder /app/dist ./dist


# Copy other necessary files (like views if MVC)

COPY --from=builder /app/src/views ./dist/views
COPY --from=builder /app/public ./public


EXPOSE 3000

# Create logs directory and give permissions to node user
RUN mkdir -p logs && chown -R node:node logs

USER node

CMD ["npm", "start"]
