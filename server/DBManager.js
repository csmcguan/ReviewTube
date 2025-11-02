class DBManager {
    
    // Singleton constructor
    constructor() {
        if (DBManager.instance) {
            return DBManager.instance;
        }

        DBManager.instance = this;
        
        //this.initDatabase();

        return this;
    }

    // getter functions for reviewtube database
    // returns strings
    dbURL()
    {
        return "mongodb://localhost:27017/";
    }

    dbName()
    {
        return "reviewtube";
    }

    // getter functions for reviewtube collections
    // returns strings
    collUser()
    {
        return "userdata";
    }

    initDatabase()
    {
        this.createCollection(collUser());
    }

    // checks if collection exists in reviewtube database
    // takes in a string collection name
    // returns a boolean if collection exists
    checkIfCollectionExists(_collection)
    {
        MongoClient.connect(dbURL(), function(err, db) 
        {
            if (err) throw err;
            let dbo = db.db(dbName());
            return dbo.ListCollectionNames().ToList().Contains(_collection);
        });
    }

    // creates a collection in the reviewtube database
    // takes in a collection name
    createCollection(_collection)
    {
        var exists = this.checkIfCollectionExists(_collection);
        if (!exists)
        {
            MongoClient.connect(dbURL(), function(err, db) 
            {
                if (err) throw err;
                let dbo = db.db(dbName());
                dbo.createCollection(_collection, function(err, res) {
                    if (err) throw err;
                    db.close();
                });
            });
        }
    }


    // inserts entry into collection
    // takes in a collection name string and entry object
    insertCollectionEntry(_collection, _entry)
    {
        MongoClient.connect(dbURL(), function(err, db) 
        {
            if (err) throw err;
            let dbo = db.db(dbName());
            dbo.collection(_collection).insertOne(_entry, function(err, res) {
                if (err) throw err;
                db.close();
            });
        });
    }

    // outputs query to a collection
    // takes in a collection name string and a query object
    // returns an array of objects matching the query
    queryCollection(_collection, _query)
    {
        MongoClient.connect(dbURL(), function(err, db) {
            if (err) throw err;
            let dbo = db.db(dbName());
            dbo.collection(_collection).find(_query).toArray(function(err, result) {
                if (err) throw err;
                db.close();
                return result;
            });
        });
    }

    createUserEntry(_username, _email, _password, _profileinfo, _birthdate)
    {
        const userEntry = {};
        
        userEntry.username = _username;
        userEntry.email = _email;
        userEntry.password = _password;
        userEntry.profileinfo = _profileinfo;
        userEntry.birthdate = _birthdate;
        userEntry.dateCreated = new Date().toLocaleDateString();

        this.insertCollectionEntry(this.collUser(), userEntry);
    }
}