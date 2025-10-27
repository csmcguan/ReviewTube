class DBManager {
  constructor() {
        if (DBManager.instance) {
            return DBManager.instance;
        }

        DBManager.instance = this;

        return this;
    }

    insertDBEntry()
    {
    }

    queryDB()
    {
        
    }
}