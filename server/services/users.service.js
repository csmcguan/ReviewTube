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
            return null;
        }

        console.log("Signing up user:", email);
        created = await dbManager.createUserEntry(name, email, password, "", new Date());

        // we probably need to have the DB assign an id
        return { id: created._id.toString(), username: created.username, email: created.email };
    },


    // handle login
    async login({ email, password }) {
        const u = await dbManager.getUserData(email);
        console.log("Attempting to log in user:", email);
        if (u && u.password === password) {
            console.log("Login successful for user:", email);
            return { ok: true, user: { id: u._id.toString(), name: u.username, email: u.email } };
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
        const user = await dbManager.getUserDataID(userId);
        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            bio: user.profileinfo ?? "",
        };
    },

    async getUserFeed(userId, startIndex, count) {
        // 1. Get all feed entries for this user from the DB
        const allEntries = await dbManager.getUserFeedEntries(userId);

        if (!allEntries || allEntries.length === 0) {
            return [];
        }

        // 2. Paginate using the DBManager helper
        const endIndex = startIndex + count;
        const page = dbManager.sliceArray(allEntries, startIndex, endIndex);

        return page;
    }
};
