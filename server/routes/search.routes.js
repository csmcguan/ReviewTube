import express from "express"
import searchController from "../controllers/search.controller.js"

const router = express.Router();

// we only have one route, how nice
router.post("/", searchController.search);

export default router