import express from "express";
import cluster from "cluster";
import os from "os";
import crypto from "crypto";
import getExternalData from "./externalService.js";
import {
  saveData,
  getData,
  getMetrics,
  incrementRequestCount,
} from "./shardedStore.js";
import {
  logClusterStart,
  logClusterFork,
  logClusterRestart,
  logWorkerStart,
  logWorkerExit,
  logRequest,
  logResponse,
  logError,
  logMetrics,
} from "./logger.js";
import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const requestCount = new client.Counter({
  name: "http_requests_total",
  help: "Total number of requests",
  labelNames: ["method", "route", "status"],
});

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logClusterStart();
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    logClusterFork(worker.id);
  }

  cluster.on("exit", (worker) => {
    logWorkerExit(worker.id);
    logClusterRestart(worker.id);
    const newWorker = cluster.fork();
    logClusterFork(newWorker.id);
  });
} else {
  const app = express();
  const PORT = process.env.PORT || 3000;

  logWorkerStart(process.pid);

  app.get("/", async (req, res) => {
    const instanceId = cluster.worker?.id || process.pid;
    requestCount.inc({ method: req.method, route: "/", status: 200 });
    logRequest(instanceId, "new");

    try {
      const id = crypto.randomUUID();
      const externalData = await getExternalData();

      await saveData(id, externalData);
      await incrementRequestCount(instanceId);

      logResponse(instanceId, id, externalData);

      res.json({
        instance: instanceId,
        id,
        data: externalData,
      });
    } catch (error) {
      logError("Error in / handler", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/data/:id", async (req, res) => {
    const instanceId = cluster.worker?.id || process.pid;
    const id = req.params.id;

    logRequest(instanceId, id);

    try {
      const data = await getData(id);
      if (data) {
        logResponse(instanceId, id, data);
        res.json({ id, data });
      } else {
        res.status(404).json({ error: "Data not found" });
      }
    } catch (error) {
      logError("Error in /data/:id handler", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
