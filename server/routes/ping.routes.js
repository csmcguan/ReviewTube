import express from "express"

const router = express.Router();

router.post("/ping", (req, res) => {
    res.status(200).json({ message: "pong" });
});

export default router;