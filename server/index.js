import express from "express";
import cors from "cors";
import path from "path";
import apiRouter from "./routes/index.js"

import {DBManager} from "./DBManager.js";
const dbManager = new DBManager();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// USE OUR API
app.use("/api", apiRouter);

// run dev
if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: 'http://localhost:3000' }));
}

app.post("/api/login", async(req, res) => {
  const { email, password } = req.body || {};

  //Test demo credentials
  if (email === "abeirf@gmail.com" && password === "demo123") {
    return res.json({ ok: true, user: { id: 1, name: "Abyan", email } });
  }

  //Checking for in-memory users
  const u = await dbManager.getUserData(email);
  if (u && u.password === password) {
    return res.json({ ok: true, user: { id: u.id, name: u.name, email: u.email } });
  }

  return res.status(401).json({ ok: false, error: "Invalid credentials" });
});

app.post("/api/signup", async(req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  const u = await dbManager.getUserData(email);
  if (u) {
    return res.status(409).json({ ok: false, error: "Email already registered" });
  }

  await dbManager.createUserEntry(name, email, password, "", new Date());

  //Auto-login after signup - Can change if needed
  return res.json({ ok: true, user: { id: u.id, name: u.name, email: u.email } });
});

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, msg: "pong" });
});

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