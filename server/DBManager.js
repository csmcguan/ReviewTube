import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

export class DBManager {
    // Singleton constructor
    constructor() {
        if (DBManager.instance) {
            return DBManager.instance;
        }

        DBManager.instance = this;

        this.initialize();

        return this;
    }

    // Initialize Database Manager 
    async initialize() {
        await this.createClient();

        await this.connectClient();
        this.database = this.client.db("reviewtube");

        await this.checkCollections();
    }

    // create Mongo Client
    async createClient() {
        const URL = "mongodb://localhost:27017/";
        this.client = new MongoClient(URL, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        }
        );
    }

    // connect client to Mongo Database
    async connectClient() {
        await this.client.connect();
        console.log("Connected to Database");
    }

    // disconnect client to Mongo Database
    async disconnectClient() {
        await this.client.close();
        console.log("Disconnected to Database");
    }

    // check if reviewtube collections exists and if not create them
    async checkCollections() {
        const collections = [this.collUser(), this.collReview(), this.collFriends(), this.collLikes()];
        const dbCollections = await this.database.listCollections().toArray();

        for (var i = 0; i < collections.length; i++) {
            var index = dbCollections.findIndex(e => e.name === collections[i]);
            if (index === -1) // if collection doesn't exist create it
            {
                await this.database.createCollection(collections[i]);
                console.log("Creating Database")
            }
        }
    }

    // Get feed entries (for now: all reviews by a given user, newest first)
    async getUserFeedEntries(_userId) {
        const query = { userId: _userId };

        // reuse the helper that queries a collection
        let arr = await this.queryCollection(this.collReview(), query);

        if (!arr) {
            return [];
        }

        // sort by createdAt descending (newest first)
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return arr;
    }

    // getter functions for reviewtube collections
    // returns strings
    collUser() {
        return "userdata";
    }

    collReview() {
        return "reviewdata";
    }

    collFriends() {
        return "frienddata";
    }

    collLikes() {
        return "likesdata";
    }

    collComments() {
        return "commentsdata";
    }

    // inserts entry into collection
    // takes in a collection name string and entry object
    async insertCollectionEntry(_collection, _entry) {
        // add missing return statement
        const result = await this.database.collection(_collection).insertOne(_entry);
        return result;
    }

    // outputs query to a collection
    // takes in a collection name string and a query object
    // returns an array of objects matching the query
    async queryCollection(_collection, _query) {
        return await this.database.collection(_collection).find(_query).toArray();
    }

    // creates a user entry and enters into user collection
    // takes in username string, email string, password string, profile info string, birthday Date
    async createUserEntry(_username, _email, _password, _profileinfo, _birthdate) {
        const userEntry = {};

        userEntry.username = _username;
        userEntry.email = _email;
        userEntry.password = _password;
        userEntry.profileinfo = _profileinfo;
        userEntry.birthdate = _birthdate.toLocaleDateString();
        userEntry.dateCreated = new Date().toLocaleDateString();

        await this.insertCollectionEntry(this.collUser(), userEntry);
        return userEntry
    }

    // outputs email query to a user collection
    // takes in a email string
    // returns an array of objects matching the query, which should only be one element
    async getUserData(_email) {
        let query = { email: _email };
        var arr = await this.queryCollection(this.collUser(), query);
        if (arr != null) {
            return arr[0];
        }
    }

    // outputs User ID query to a user collection
    // takes in a user ID string
    // returns an array of objects matching the query, which should only be one element
    async getUserDataID(_userID) {
        const ID = new ObjectId(_userID);
        let query = { _id: ID };
        var arr = await this.queryCollection(this.collUser(), query);
        if (arr != null) {
            return arr[0];
        }
    }

    // Updates the user profile info
    // takes in profile string and user ID string
    // returns result of the update
    async updateUserProfile(_userID, _profileInfo) {
        const coll = this.database.collection(this.collUser());
        const ID = new ObjectId(_userID);
        const filter = { _id: ID };
        const update = { $set: { _id: ID, profileinfo: _profileInfo } };
        const result = await coll.updateOne(filter, update);
        return result;
    }

    async verifyUser(_email, _password) {
        var user = await this.getUserData(_email);
        if (user != null) {
            return (user.password === _password);
        }
        else {
            return false;
        }
    }

    // Creates a review entry
    async createReviewEntry(_type, _targetId, _rating, _reviewText, _userId) {
        const reviewEntry = {};
        reviewEntry.type = _type;
        reviewEntry.targetId = _targetId;
        reviewEntry.rating = _rating;
        reviewEntry.reviewText = _reviewText;
        reviewEntry.userId = _userId;
        reviewEntry.createdAt = new Date().toISOString();

        const result = await this.insertCollectionEntry(this.collReview(), reviewEntry);

        // Attach Mongo _id so the caller can use it if needed
        return { ...reviewEntry, _id: result.insertedId };
    }

    async getReviewEntries(_type, _targetId, _userId) {
        const query = {};
        if (_type !== null) {
            query.type = _type;
        }

        if (_targetId !== null) {
            query.targetId = _targetId;
        }

        if (_userId !== null) {
            query.userId = _userId;
        }

        return await this.queryCollection(this.collReview(), query);
    }

    async createFriendEntry(_firstID, _secondID, _status) {
        const friendEntry = {};
        friendEntry.firstID = _firstID;
        friendEntry.secondID = _secondID;
        friendEntry.status = _status;
        await this.insertCollectionEntry(this.collFriends(), friendEntry);
    }

    async getFriendEntries(_firstID, _secondID, _status) {
        const query = {};
        if (_firstID !== null) {
            query.firstID = _firstID;
        }

        if (_secondID !== null) {
            query.secondID = _secondID;
        }

        if (_status !== null) {
            query.status = _status;
        }

        return await this.queryCollection(this.collFriends(), query);
    }

    async updateFriendEntries(_firstID, _secondID, _status) {
        const coll = this.database.collection(this.collFriends());
        const filter = { firstID: _firstID, secondID: _secondID };
        const update = { $set: { status: _status } };
        const result = await coll.updateOne(filter, update);
        return result;
    }

    async createLikeEntry(_reviewID, _userID) {
        const likeEntry = {};
        likeEntry.reviewID = _reviewID;
        likeEntry.userID = _userID;
        await this.insertCollectionEntry(this.collLikes(), likeEntry);
    }

    async getLikeEntries(_reviewID, _userID) {
        const query = {};
        if (_reviewID !== null) {
            query.reviewID = _reviewID;
        }

        if (_userID !== null) {
            query.userID = _userID;
        }

        return await this.queryCollection(this.collLikes(), query);
    }

    async deleteLikeEntries(_reviewID, _userID) {
        const coll = this.database.collection(this.collLikes());
        const query = {};
        if (_reviewID !== null) {
            query.reviewID = _reviewID;
        }
        if (_userID !== null) {
            query.userID = _userID;
        }
        await coll.deleteMany(query);
    }

    async createCommentEntry(_reviewID, _userID, _comment) {
        const commentEntry = {};
        commentEntry.reviewID = _reviewID;
        commentEntry.userID = _userID;
        commentEntry.comment = _comment;
        await this.insertCollectionEntry(this.collComments(), commentEntry);
    }

    async getCommentEntries(_reviewID, _userID, _comment) {
        const query = {};
        if (_reviewID !== null) {
            query.reviewID = _reviewID;
        }

        if (_userID !== null) {
            query.userID = _userID;
        }

        if (_comment !== null) {
            query.comment = _comment;
        }
        return await this.queryCollection(this.collComments(), query);
    }

    // slice Array is a wrapper around javascript slice
    // slice accepts integers that aren't valid indices for the array
    sliceArray(_arr, _startIndex, _endIndex) {
        if (_arr === null) {
            return _arr;
        }
        if (_startIndex === null && _endIndex === null) {
            return _arr.slice();
        }
        else if (_startIndex !== null && _endIndex === null) {
            return _arr.slice(_startIndex);
        }
        return _arr.slice(_startIndex, _endIndex);
    }


}