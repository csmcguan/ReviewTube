class DBManager {
    
    // Singleton constructor
    constructor() {
        if (DBManager.instance) {
            return DBManager.instance;
        }

        DBManager.instance = this;

        return this;
    }

    // getter functions for reviewtube database
    // returns strings
    static get dbURL()
    {
        return "mongodb://localhost:27017/";
    }

    static get dbName()
    {
        return "reviewtube";
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

}