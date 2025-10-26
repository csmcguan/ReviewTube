import express from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan"
import {fileURLToPath} from "url";

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(morgan("dev"));

if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: 'http://localhost:3000' }));
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  //Test demo credentials
  if (email === "abeIrf@gmail.com" && password === "demo123") {
    return res.json({ ok: true, user: { id: 1, name: "Abyan", email } });
  }

  return res.status(401).json({ ok: false, error: "Invalid credentials" });
});
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});//Testing if server is listening to client requests
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});

// serve for prod
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (rq, res) =>
    res.sendFile(path.join(__dirname, "../client/build/index.html"))
  );
}