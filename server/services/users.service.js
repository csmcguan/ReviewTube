// services/user.service.js
import { DBManager } from "../DBManager.js";

const dbManager = new DBManager();

export const userService = {

    // handle signup
    async signup({ name, email, password }) {

        //
        // WE NEED TO HASH PASSWORDS
        //

        const u = await dbManager.getUserData(email);
        if (u) {
            console.error("Email already registered during:", email);
            return res.status(409).json({ ok: false, error: "Email already registered" });
        }

        console.log("Signing up user:", email);
        await dbManager.createUserEntry(name, email, password, "", new Date());

        // we probably need to have the DB assign an id
        return { name, email };
    },


    // handle login
    async login({ email, password }) {
        const u = await dbManager.getUserData(email);
        console.log("Attempting to log in user:", email);
        if (u && u.password === password) {
            console.log("Login successful for user:", email);
            return { ok: true, user: { id: u.id, name: u.name, email: u.email } };
        }
    },

    // handle follow
    async follow({ userId, targetId }) {
        // Prevent self-follow
        if (userId === targetId) {
            console.error("Attempted to follow self:", userId);
            throw new Error("Cannot follow yourself");
        }
    },


    // handle unfollow
    async unfollow({ userId, targetId }) {

    },

    // handle blocking a user
    async blockUser({ userId, targetId }) {

    },

    // get a user's profile
    async getProfile(userId) {
        
    }
};
