# 🚀 Node.js Scalable + Resilient Microservice System

This project demonstrates a **scalable and resilient Node.js system** that uses clustering, NGINX load balancing, Redis-based data sharing, and retry/fallback logic when dealing with unstable external services.

---

## 📦 Features

- **Node.js** (Express)
- **NGINX** (Load Balancer)
- **Redis** (Sharded storage)
- **Docker + Docker Compose**
- **Cluster module for horizontal scaling**
- **Retry with fallback** for resilience
- **Metrics endpoint** for observability

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

## 📦 Project Structure

```
.
├── docker-compose.yml
├── nginx
│   └── default.conf
├── services
│   ├── app.js
│   ├── externalService.js
│   ├── shardedStore.js
│   ├── unstable.js
│   ├── Dockerfile
│   └── ...
└── README.md
```

---

## 🚀 Setup Instructions

### 🛠 Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### ▶ Start the System

```bash
docker-compose up --build
```

### ⛔ Stop the System

```bash
docker-compose down
```

---

## 🌐 Endpoints

### 1. `GET /`

Fetch external data and store it via sharding. Response includes:

```json
{
  "instance": 18722,
  "id": 1234,
  "data": {
    "timestamp": 1752490124092,
    "message": "External service OK"
  }
}
```

### 2. `GET /data/:id`

Fetch previously stored data by ID:

```bash
curl http://localhost:8080/data/1234
```

Response:

```json
{
  "id": 1234,
  "data": {
    "timestamp": 1752490124092,
    "message": "External service OK"
  }
}
```

### 3. `GET /metrics`

Returns simple runtime metrics:

```bash
curl http://localhost:8080/metrics
```

Example output:

```
uptime_seconds 123.456
requests_total 27
requests_failed 3
redis_keys_total 8
```

---

## ⚙️ Scalability Techniques

### 1. 🔁 Load Balancing

- Implemented using **NGINX**.
- NGINX forwards traffic to `app1` and `app2` instances.

### 2. ⚡ Horizontal Scaling

- Node.js **cluster** module used to spawn workers equal to CPU count.
- Requests are distributed among worker processes.

### 3. 🧱 Sharding (via Redis)

- Data is stored in Redis shards based on ID hash.
- Scalable design simulating partitioned data storage.

---

## 🛡️ Resilience Pattern

### ✅ Retry with Fallback

- On request to external service:
  - Retries up to 3 times
  - If still failing, returns a fallback:

```json
{
  "message": "Fallback response"
}
```

---

## 💥 Failure & Recovery Simulation

### 🔁 Retry + Fallback

- Simulated via `externalService.js` calling `unstable-service`
- If it fails or delays too long:
  - Retry logic triggers
  - Fallback is returned

### 🧪 Test Failure

**Option 1:** Modify `unstable.js` failure rate

```js
if (Math.random() < 0.8) { // 80% failure
```

**Option 2:** Stop service

```bash
docker-compose stop unstable-service
```

**Then:**

```bash
curl http://localhost:8080/
```

Response:

```json
{
  "data": {
    "message": "Fallback response"
  }
}
```

### 🔄 Test Recovery

```bash
docker-compose start unstable-service
```

Retry request:

```bash
curl http://localhost:8080/
```

You’ll now get real external data again.

---

## 🐳 Docker Services

| Service           | Description                          | Port   |
|-------------------|--------------------------------------|--------|
| app1 / app2       | Node.js services (clustered)         | 3000   |
| nginx             | Load balancer                        | 8080   |
| redis1 / redis2   | Redis shards                         | 6379+  |
| unstable-service  | Mock service with random failures    | 4000   |

---

## 🔧 Useful Commands

### Check all containers

```bash
docker ps
```

### Logs for `app1`

```bash
docker-compose logs app1
```

### Shell into a service container

```bash
docker exec -it <container_name> /bin/sh
```

---

## ✅ Example Workflow

```bash
# 1. Call main endpoint
curl http://localhost:8080/

# 2. Get data by ID
curl http://localhost:8080/data/1234

# 3. Monitor metrics
curl http://localhost:8080/metrics
```

---

## 📈 Bonus Features

- [x] Load balanced with NGINX
- [x] Clustered Node.js workers
- [x] Redis-based sharded storage
- [x] Fallback + retry mechanism
- [x] Monitoring via `/metrics`
- [x] Dockerized with Docker Compose

---