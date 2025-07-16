import { createClient } from "redis";
import {
  logRedisError,
  logRedisSuccess,
  logRedisSave,
  logRedisGet,
  logRedisIncrement,
  logRedisMetrics,
  logRedisConnection,
  logRedisDisconnection,
} from "./logger.js";

let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: "redis://redis:6379" });

    redisClient.on("connect", () => logRedisConnection());
    redisClient.on("end", () => logRedisDisconnection());
    redisClient.on("error", (err) => logRedisError("connect", err));

    try {
      await redisClient.connect();
    } catch (err) {
      logRedisError("initial connection", err);
    }
  }
  return redisClient;
}

/**
 * Save data to Redis and increment the total_saved counter.
 */
export async function saveData(id, data) {
  try {
    const client = await getRedisClient();
    await client.set(id.toString(), JSON.stringify(data));
    await client.incr("total_saved");
    logRedisSave(id);
  } catch (err) {
    logRedisError("save", err);
  }
}

/**
 * Retrieve data from Redis by ID.
 */
export async function getData(id) {
  try {
    const client = await getRedisClient();
    const value = await client.get(id.toString());
    const parsed = value ? JSON.parse(value) : null;
    logRedisGet(id, parsed);
    return parsed;
  } catch (err) {
    logRedisError("get", err);
    return null;
  }
}

/**
 * Increment request count for the given instance.
 */
export async function incrementRequestCount(instanceId) {
  try {
    const client = await getRedisClient();
    await client.incr(`requests:${instanceId}`);
    logRedisIncrement(instanceId);
  } catch (err) {
    logRedisError("incrementRequestCount", err);
  }
}

/**
 * Get metrics for a given instance.
 */
export async function getMetrics(instanceId) {
  try {
    const client = await getRedisClient();
    const totalSavedRaw = await client.get("total_saved");
    const totalRequestsRaw = await client.get(`requests:${instanceId}`);

    const totalSaved = totalSavedRaw === null ? 0 : Number(totalSavedRaw);
    const totalRequests = totalRequestsRaw === null ? 0 : Number(totalRequestsRaw);

    const metrics = {
      instanceId,
      totalSaved,
      totalRequests,
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };

    logRedisMetrics(metrics);
    return metrics;
  } catch (err) {
    logRedisError("getMetrics", err);
    return {
      instanceId,
      totalSaved: 0,
      totalRequests: 0,
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
