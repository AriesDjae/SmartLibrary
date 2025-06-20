const { MongoClient } = require('mongodb');
require('dotenv').config();

let dbConnection;

// Default MongoDB URI for localhost
const defaultUri = 'mongodb://localhost:3000/smartlibrary';

// Use environment variable if available, otherwise use default
const uri = process.env.MONGODB_URI || defaultUri;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(uri)
            .then((client) => {
                dbConnection = client.db();
                console.log('Successfully connected to MongoDB.');
                return cb();
            })
            .catch(err => {
                console.error('Error connecting to MongoDB:', err);
                return cb(err);
            });
    },
    getDb: () => dbConnection
};
