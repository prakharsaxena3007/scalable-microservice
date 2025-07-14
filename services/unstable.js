import express from "express";

const app = express();
const PORT = 4000;

app.get("/data", (req, res) => {
  const shouldFail = Math.random() < 0.3;
  const shouldDelay = Math.random() < 0.3;

  if (shouldFail) {
    return res.status(500).json({ error: "Simulated failure" });
  }

  const response = {
    timestamp: Date.now(),
    message: "External service OK",
  };

  if (shouldDelay) {
    setTimeout(() => res.json(response), 3000);
  } else {
    res.json(response);
  }
});

app.listen(PORT, () => {
  console.log(`Unstable service running on port ${PORT}`);
});
