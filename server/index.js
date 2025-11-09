const express = require("express");
const cors = require("cors");
const path = require("path");

const {DBManager} = require("./DBManager");
const dbManager = new DBManager();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// run dev
if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: 'http://localhost:3000' }));
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  //Test demo credentials
  if (email === "abeirf@gmail.com" && password === "demo123") {
    return res.json({ ok: true, user: { id: 1, name: "Abyan", email } });
  }

  return res.status(401).json({ ok: false, error: "Invalid credentials" });
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