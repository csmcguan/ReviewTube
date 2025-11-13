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
}