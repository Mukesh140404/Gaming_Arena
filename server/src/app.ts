import express from "express";
import path from "node:path";

const app = express();

app.get("/", (req, res) => {
  return res.sendFile(path.resolve("./index.html"));
});

export default app;