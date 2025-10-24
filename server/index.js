const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("hello!!!!!!!!!!!!");
});

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

