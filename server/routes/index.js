import express from "express";
import ping from "./ping.routes.js";
import searchRoutes from "./search.routes.js";
import usersRoutes from "./users.routes.js";
import reviewRoutes from "./review.routes.js";

const router = express.Router();

// ping route
router.use(
    "/ping", 
    ping
);

// search route
router.use(
    "/search", 
    searchRoutes
);

// user routes
router.use(
    "/users", 
    usersRoutes
);

// review routes
router.use(
    "/reviews", 
    reviewRoutes
);

export default router;