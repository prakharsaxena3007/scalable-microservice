import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

export default logger;
export function logError(message, error) {
  logger.error(`${message}: ${error.message}`, { stack: error.stack });
}
export function logInfo(message) {
  logger.info(message);
}
export function logDebug(message) {
  if (process.env.NODE_ENV !== "production") {
    logger.debug(message);
  }
}
export function logWarning(message) {
  logger.warn(message);
}
export function logMetrics(metrics) {
  logger.info("Metrics", {
    instanceId: metrics.instanceId,
    totalSaved: metrics.totalSaved,
    totalRequests: metrics.totalRequests,
    uptimeSeconds: metrics.uptimeSeconds,
    memoryUsage: metrics.memoryUsage,
  });
}
export function logRequest(instanceId, id) {
  logger.info(`Request handled by instance ${instanceId} for ID ${id}`);
}
export function logResponse(instanceId, id, data) {
  logger.info(`Response sent by instance ${instanceId} for ID ${id}`, {
    data: JSON.stringify(data),
  });
}
export function logWorkerStart(workerId) {
  logger.info(`Worker ${workerId} started`);
}
export function logWorkerExit(workerId) {
  logger.info(`Worker ${workerId} exited`);
}
export function logClusterStart() {
  logger.info("Cluster started");
}
export function logClusterExit(workerId) {
  logger.info(`Cluster worker ${workerId} exited`);
}
export function logClusterFork(workerId) {
  logger.info(`Cluster worker ${workerId} forked`);
}
export function logClusterRestart(workerId) {
  logger.info(`Cluster worker ${workerId} restarted`);
}
export function logClusterMetrics(metrics) {
  logger.info("Cluster Metrics", {
    totalWorkers: metrics.totalWorkers,
    activeWorkers: metrics.activeWorkers,
    idleWorkers: metrics.idleWorkers,
    totalRequests: metrics.totalRequests,
    totalSaved: metrics.totalSaved,
  });
}
export function logExternalServiceCall(url, retries) {
  logger.info(`Calling external service at ${url} with ${retries} retries left`);
}
export function logExternalServiceSuccess(url, response) {
  logger.info(`External service call to ${url} succeeded`, {
    response: JSON.stringify(response),
  });
}
export function logExternalServiceFailure(url, error) {
  logger.error(`External service call to ${url} failed: ${error.message}`, {
    stack: error.stack,
  });
}
export function logExternalServiceFallback(url) {
  logger.warn(`Using fallback for external service call to ${url}`);
}
export function logRedisError(action, error) {
  logger.error(`Redis ${action} error: ${error.message}`, {
    stack: error.stack,
  });
}
export function logRedisSuccess(action, details) {
  logger.info(`Redis ${action} succeeded`, details);
}
export function logRedisSave(id) {
  logger.info(`Data saved to Redis with ID ${id}`);
}
export function logRedisGet(id, data) {
  logger.info(`Data retrieved from Redis with ID ${id}`, {
    data: JSON.stringify(data),
  });
}
export function logRedisIncrement(instanceId) {
  logger.info(`Request count incremented for instance ${instanceId}`);
}
export function logRedisMetrics(metrics) {
  logger.info("Redis Metrics", {
    totalSaved: metrics.totalSaved,
    totalRequests: metrics.totalRequests,
    uptimeSeconds: metrics.uptimeSeconds,
    memoryUsage: metrics.memoryUsage,
  });
}
export function logRedisConnection() {
  logger.info("Connected to Redis");
}
export function logRedisDisconnection() {
  logger.info("Disconnected from Redis");
}