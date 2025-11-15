import { userService } from "../services/users.service.js";

export const userController = {

    // handle and validate signup requests
    async signup(req, res, next) {
        try {
            // fundamentals
            const { name, email, password } = req.body;

            // check for missing fields
            if (!name || !email || !password) {
                console.error("Missing name, email, or password");
                return res.status(400).json({ error: "Missing name, email, or password" });
            }

            const user = await userService.signup({ name, email, password });
            console.log("User signed up:", user);
            return res.status(201).json({ ok: true, user });
        } catch (err) {
            // dump the error
            console.error("Signup error:", err);
            next(err);
        }
    },

    // handle login requests
    async login(req, res, next) {
        try {
            // extract email and password
            const { email, password } = req.body;

            // check for missing fields
            if (!email || !password) {
                console.error("Missing email or password");
                return res.status(400).json({ error: "Missing email or password" });
            }

            const result = await userService.login({ email, password });
            if (!result) {
                console.error("Invalid credentials for email:", email);
                return res.status(401).json({ ok: false, error: "Invalid credentials" });
            }

            console.log("User logged in:", result.user);
            return res.json({ ok: true, user: result.user });
        } catch (err) {
            console.error("Login error:", err);
            next(err);
        }
    },

    // handle logout requestss
    async logout(_req, res, next) {
        try {
            console.log("User logged out");
            return res.json({ ok: true, message: "Logged out" });
        } catch (err) {
            console.error("Logout error:", err);
            next(err);
        }
    },

    // handle follow
    async follow(req, res, next) {
        try {
            const { userId, targetId } = req.params;
            await userService.follow({ userId, targetId });
            console.log(`User ${userId} followed ${targetId}`);
            return res.status(201).json({
                ok: true,
                message: `User ${userId} followed ${targetId}`,
            });
        } catch (err) {
            console.error("Follow error:", err);
            next(err);
        }
    },

    // handle unfollow
    async unfollow(req, res, next) {
        try {
            const { userId, targetId } = req.params;
            await userService.unfollow({ userId, targetId });
            console.log(`User ${userId} unfollowed ${targetId}`);
            return res.status(201).json({
                ok: true,
                message: `User ${userId} unfollowed ${targetId}`,
            });
        } catch (err) {
            console.error("Follow error:", err);
            next(err);
        }
    },

    // handle block requests
    async blockUser(req, res, next) {
        try {
            const { userId, targetId } = req.params;
            await userService.blockUser({ userId, targetId });
            console.log(`User ${userId} blocked ${targetId}`);
            return res.status(201).json({
                ok: true,
                message: `User ${targetId} blocked`,
            });
        } catch (err) {
            console.error("Block user error:", err);
            next(err);
        }
    },

    // view own profile
    async getMyProfile(req, res, next) {
        try {
            const userId = req.query.userId;
            const profile = await userService.getProfile(userId);
            return res.json({ ok: true, user: profile });
        } catch (err) {
            console.error("Get my profile error:", err);
            next(err);
        }
    },

    // view another user's profile
    async getUserProfile(req, res, next) {
        try {
            const { userId } = req.params;
            const profile = await userService.getProfile(userId);
            if (!profile) {
                console.error("User not found:", userId);
                return res.status(404).json({ ok: false, error: "User not found" });
            }
            return res.json({ ok: true, user: profile });
        } catch (err) {
            console.error("Get user profile error:", err);
            next(err);
        }
    },
};