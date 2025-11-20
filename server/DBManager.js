import { MongoClient, ServerApiVersion } from "mongodb";

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
    async initialize()
    {   
        await this.createClient();

        await this.connectClient();
        this.database = this.client.db("reviewtube");

        await this.checkCollections();

        //await this.createUserEntry("Abyan", "abeirf@gmail.com", "demo123","", new Date());

        //await this.verifyUser("abeirf@gmail.com", "demo123");

        //var test = await this.getReviewEntries("video", -1, -1, 1, 3);
    }

    // create Mongo Client
    async createClient()
    {
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
    async connectClient()
    {
        await this.client.connect();
        console.log("Connected to Database");
    }

    // disconnect client to Mongo Database
    async disconnectClient()
    {
        await this.client.close();
        console.log("Disconnected to Database");
    }

    // check if reviewtube collections exists and if not create them
    async checkCollections()
    {
        const collections = [this.collUser(), this.collReview()];
        const dbCollections = await this.database.listCollections().toArray();
        
        for (var i = 0; i < collections.length; i++) 
        { 
            var index = dbCollections.findIndex(e => e.name === collections[i]);
            if(index === -1) // if collection doesn't exist create it
            {
                await this.database.createCollection(collections[i]);
                console.log("Creating Database")
            }
        }
    }


    // getter functions for reviewtube collections
    // returns strings
    collUser()
    {
        return "userdata";
    }

    collReview()
    {
        return "reviewdata";
    }

    // inserts entry into collection
    // takes in a collection name string and entry object
    async insertCollectionEntry(_collection, _entry)
    {
        await this.database.collection(_collection).insertOne(_entry);
    }

    // outputs query to a collection
    // takes in a collection name string and a query object
    // returns an array of objects matching the query
    async queryCollection(_collection, _query)
    {
        return await this.database.collection(_collection).find(_query).toArray();
    }

    // creates a user entry and enters into user collection
    // takes in username string, email string, password string, profile info string, birthday Date
    async createUserEntry(_username, _email, _password, _profileinfo, _birthdate)
    {
        const userEntry = {};
        
        userEntry.username = _username;
        userEntry.email = _email;
        userEntry.password = _password;
        userEntry.profileinfo = _profileinfo;
        userEntry.birthdate = _birthdate.toLocaleDateString();
        userEntry.dateCreated = new Date().toLocaleDateString();

        await this.insertCollectionEntry(this.collUser(), userEntry);
    }

    // outputs email query to a user collection
    // takes in a collection name string and a query object
    // returns an array of objects matching the query
    async getUserData(_email)
    {
        let query = {email : _email};
        var arr = await this.queryCollection(this.collUser(), query);
        if ( arr != null)
        {
            return arr[0];
        }
    }

    async verifyUser(_email, _password)
    {
        var user = await this.getUserData(_email);
        if(user != null)
        {
            return (user.password === _password);
        }
        else
        {
            return false;
        }
    }

    async createReviewEntry(_type, _targetId, _rating, _reviewText, _userId)
    {
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

    async getReviewEntries(_type, _targetId, _userId, _startIndex, _endIndex)
    {
        const query = {};
        if(_type !== "")
        {
            query.type = _type;
        }

        if(_targetId !== -1)
        {
            query.targetId = _targetId;
        }

        if(_userId !== -1)
        {
            query.userId = _userId;
        }

        var arr = await this.queryCollection(this.collReview(), query);
        var startInBounds = (_startIndex >= 0) && (_startIndex < arr.length);
        var endInBounds = (_endIndex >= 0) && (_endIndex < arr.length);
        
        if(startInBounds && endInBounds && _startIndex < _endIndex)
        {
            var copyArr = arr.slice(_startIndex, _endIndex);
            return copyArr;
        }
        else
        {
            return arr;
        }
    }
}