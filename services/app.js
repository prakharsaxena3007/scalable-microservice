// import express from "express";
// import os from "os";
// const numCPUs = os.cpus().length;
// import cluster from "cluster";
// import fetch from "node-fetch";
// import getExternalData from "./externalService.js";H
// const startServer = () => {
//   const app = express();
//   const PORT = process.env.PORT || 3000;

//   app.get("/", async (req, res) => {
//     try {
//       console.log("Hi I am here");
//       console.log("typeof getExternalData:", typeof getExternalData);
//       //   const data = await getExternalData();
//       res.json({ instance: process.pid, data });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.get("/metrics", (req, res) => {
//     res.send(`uptime_seconds ${process.uptime()}`);
//   });

//   app.listen(PORT, () =>
//     console.log(`Worker ${process.pid} running on port ${PORT}`)
//   );
// };

// if (cluster.isPrimary) {
//   console.log(`Primary ${process.pid} is running`);
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }
// } else {
//   startServer();
// }

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
