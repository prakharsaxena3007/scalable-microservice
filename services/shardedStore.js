import { createClient } from "redis";

const redis = createClient({ url: "redis://redis:6379" }); 
await redis.connect();

export async function saveData(id, data) {
  try {
    await redis.set(id.toString(), JSON.stringify(data));
    await redis.incr("total_saved");
  } catch (err) {
    console.error("Redis save error:", err);
  }
}

export async function getData(id) {
  try {
    const value = await redis.get(id.toString());
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error("Redis get error:", err);
    return null;
  }
}

export async function incrementRequestCount(instanceId) {
  await redis.incr(`requests:${instanceId}`);
}

export async function getMetrics(instanceId) {
  const totalSaved = (await redis.get("total_saved")) || 0;
  const totalRequests = (await redis.get(`requests:${instanceId}`)) || 0;

  return {
    instanceId,
    totalSaved: Number(totalSaved),
    totalRequests: Number(totalRequests),
    uptimeSeconds: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };
}
