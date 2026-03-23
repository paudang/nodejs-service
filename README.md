# 12323eee

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
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yourusername/12323eee/ci.yml?branch=main)
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
docker build -t 12323eee .

# Run Container (attached to the compose network)
docker run -p 3000:3000 --network 12323eee_default \
  -e DB_HOST=db \
  -e REDIS_HOST=redis \
  12323eee
```

## 🚀 PM2 Deployment (VPS/EC2)
This project is pre-configured for direct deployment to a VPS/EC2 instance using **PM2** (via `ecosystem.config.js`).
1. Install dependencies
```bash
npm install
```
2. **Start Infrastructure (DB, Redis, Kafka, etc.) in the background**
*(This specifically starts the background services without running the application inside Docker, allowing PM2 to handle it).*
```bash
docker-compose up -d db redis
```
3. **Wait 5-10s** for the database to fully initialize.
4. **Deploy the App using PM2 in Cluster Mode**
```bash
npm run build
npm run deploy
```
5. **Check logs**
```bash
npx pm2 logs
```
6. Stop and remove the PM2 application
```bash
npx pm2 delete 12323eee
```
7. Stop and remove the Docker infrastructure
```bash
docker-compose down
```

## 🔒 Security Features
-   **Helmet**: Sets secure HTTP headers.
-   **CORS**: Configured for cross-origin requests.
-   **Rate Limiting**: Protects against DDoS / Brute-force.
-   **HPP**: Prevents HTTP Parameter Pollution attacks.


## 🤖 AI-Native Development

This project is "AI-Ready" out of the box. We have pre-configured industry-leading AI context files to bridge the gap between "Generated Code" and "AI-Assisted Development."

- **Magic Defaults**: We've automatically tailored your AI context to focus on **12323eee** and its specific architectural stack (MVC, MySQL, etc.).
- **Use Cursor?** We've configured **`.cursorrules`** at the root. It enforces project standards (80% coverage, MVC/Clean) directly within the editor. 
  - *Pro-tip*: You can customize the `Project Goal` placeholder in `.cursorrules` to help the AI understand your specific business logic!
- **Use ChatGPT/Gemini/Claude?** Check the **`prompts/`** directory. It contains highly-specialized Agent Skill templates. You can copy-paste these into any LLM to give it a "Senior Developer" understanding of your codebase immediately.
