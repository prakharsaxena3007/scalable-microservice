import express from "express";
import cluster from "cluster";
import os from "os";
import getExternalData from "./externalService.js";
import { saveData, getData, getMetrics } from "./shardedStore.js";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} running`);
  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.get("/", async (req, res) => {
    const id = Math.floor(Math.random() * 10000);
    const externalData = await getExternalData();
    saveData(id, externalData);

    res.json({
      instance: process.pid,
      id,
      data: externalData,
    });
  });

  app.get("/data/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await getData(id);
    if (data) {
      res.json({ id, data });
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  });

  app.get("/metrics", async (req, res) => {
    const metrics = await getMetrics(process.pid);
    res.json(metrics);
  });

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
