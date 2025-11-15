import express from "express";
import searchRoutes from "./search.routes.js";
import usersRoutes from "./users.routes.js";
import reviewRoutes from "./review.routes.js";

const router = express.Router();
router.use("/search", searchRoutes);
router.use("/users", usersRoutes);
router.use("/reviews", reviewRoutes);

export default router;