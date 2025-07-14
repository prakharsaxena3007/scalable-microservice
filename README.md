# 🚀 Node.js Scalable + Resilient Microservice System

This project demonstrates a **scalable and resilient Node.js system** that uses clustering, NGINX load balancing, Redis-based data sharing, and retry/fallback logic when dealing with unstable external services.

---

## 📦 Features

- ✅ **Clustering**: Multi-core utilization via `cluster` module.
- ✅ **Load Balancing**: NGINX balances traffic between app instances.
- ✅ **Retry + Fallback**: External service is unstable — our app retries with fallback.
- ✅ **Redis Caching**: Shared data and metrics stored in Redis.
- ✅ **Real-time Metrics**: `/metrics` exposes per-instance performance data.

---

## 🧱 Architecture

           ┌────────────┐
           │  Client    │
           └────┬───────┘
                │
          ┌─────▼─────┐
          │   NGINX   │
          └────┬──────┘
       ┌───────┼────────┐
   ┌───▼───┐ ┌──▼────┐ ┌────────────┐
   │ app1  │ │ app2  │ │ unstable.js│
   └───────┘ └───────┘ └────────────┘
       │         │
     ┌─▼─────────▼─┐
     │   Redis DB  │
     └─────────────┘



---

## 📁 Folder Structure

.
├── docker-compose.yml
├── nginx/
│ └── default.conf
├── services/
│ ├── app.js
│ ├── externalService.js
│ ├── shardedStore.js
│ ├── unstable.js
│ └── Dockerfile



---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose

### Clone & Start

```bash
git clone <your-repo-url>
cd your-project
docker-compose up --build


# Main app via NGINX
http://localhost:8080/

# Get metrics
http://localhost:8080/metrics

# Fetch saved data (replace ID)
http://localhost:8080/data/<id>
