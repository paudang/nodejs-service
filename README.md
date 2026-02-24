# nodejs-service

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![License](https://img.shields.io/badge/License-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)

A production-ready Node.js microservice generated with **MVC** and **MySQL**.
This project comes pre-configured with industry-standard tooling for **Code Quality**, **Testing**, and **Security**.

## 🚀 Key Features

-   **Architecture**: MVC (MVC Pattern).
-   **Database**: MySQL with **Flyway** migrations.
-   **Security**: Helmet, CORS, Rate Limiting, HPP.
-   **Quality**: Eslint, Prettier, Husky, Lint-Staged.
-   **Testing**: Jest (Unit & Integration).
-   **DevOps**: Multi-stage Docker build, CI/CD ready.

## 🔄 CI/CD Pipeline
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yourusername/nodejs-service/ci.yml?branch=main)
This project includes a **GitHub Actions** workflow located in `.github/workflows/ci.yml`.
It automatically runs:
-   Linting
-   Tests
-   Builds

## 🛠️ Getting Started

### 1. Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose

### 2. Quick Start
```bash
# Initialize Git (Required for Husky)
git init

# Install dependencies
npm install

# Setup Git Hooks (Husky)
npm run prepare

# Start Infrastructure (DB, etc.)
docker-compose up -d

# Run Development Server
npm run dev
```

### 3. Development Standards
Ensure your code meets quality standards before committing:

```bash
# Run Linter
npm run lint

# Run Tests
npm test

# Format Code
npm run format
```

## 📂 Project Structure

The project follows **MVC** principles.
API is exposed via **REST**.
A Swagger UI for API documentation is available at:
- **URL**: `http://localhost:3000/api-docs` (Dynamic based on PORT)

## ⚡ Caching
This project uses **Redis** for caching.
- **Client**: `ioredis`
- **Connection**: Configured via `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in `.env`.

## 📝 Logging
This project uses **Winston** for structured logging.
- **Development**: Logs are printed to the console.
- **Production**: Logs are saved to files:
  - `error.log`: Only error level logs.
  - `combined.log`: All logs.

## 🐳 Docker Deployment
This project uses a **Multi-Stage Dockerfile** for optimized production images.

### 1. Running Locally (Development)
To run the Node.js application locally while using Docker for the infrastructure (Database, Redis, Kafka, etc.):

```bash
# Start infrastructure
docker-compose up -d db redis

# Start the application
npm run dev
```

### 2. Running the App Container with Compose Infrastructure
If you want to run the application itself inside a Docker container while connecting to the infrastructure managed by your `docker-compose.yml`:

```bash
# First, ensure your infrastructure is running
docker-compose up -d

# Build Production Image
docker build -t nodejs-service .

# Run Container (attached to the compose network)
docker run -p 3000:3000 --network nodejs-service_default \
  -e DB_HOST=db \
  -e REDIS_HOST=redis \
  nodejs-service
```

## 🔒 Security Features
-   **Helmet**: Sets secure HTTP headers.
-   **CORS**: Configured for cross-origin requests.
-   **Rate Limiting**: Protects against DDoS / Brute-force.
-   **HPP**: Prevents HTTP Parameter Pollution attacks.