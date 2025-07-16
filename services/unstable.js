import express from "express";
import client from "prom-client";

const app = express();
const PORT = 4000;

const failureCounter = new client.Counter({
  name: "failures_total",
  help: "Total number of simulated failures",
});

const delayCounter = new client.Counter({
  name: "delays_total",
  help: "Total number of simulated delays",
});

client.collectDefaultMetrics();

app.get("/data", (req, res) => {
  const shouldFail = req.query.fail === "true" || Math.random() < 0.3;
  const shouldDelay = req.query.delay === "true" || Math.random() < 0.3;

  if (shouldFail) {
    failureCounter.inc();
    return res.status(500).json({ error: "Simulated failure" });
  }

  const response = {
    timestamp: Date.now(),
    message: "External service OK",
  };

  if (shouldDelay) {
    delayCounter.inc();
    setTimeout(() => res.json(response), 3000);
  } else {
    res.json(response);
  }
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Unstable service running on port ${PORT}`);
});
