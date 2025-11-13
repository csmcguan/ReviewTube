import express from "express";
import cors from "cors";
import path from "path";
import apiRouter from "./routes/index.js"

import {DBManager} from "./DBManager.js";
const dbManager = new DBManager();

const app = express();
// Demo in-memory users store (resets when server restarts)- Use until MongoDB is set up
const users = new Map(); // key: email -> value: { id, name, email, password }
let nextId = 2; // 1 is used by the demo user in login
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// USE OUR API
app.use("/api", apiRouter);

// run dev
if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: 'http://localhost:3000' }));
}

// serve for prod
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/build");
  app.use(express.static(buildPath));
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return (next());
    }
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

//Testing if server is listening to client requests
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});