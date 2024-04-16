const { MongoClient } = require('mongodb');

require('dotenv').config();

const username = process.env.USERNAME
const password = process.env.PASSWORD;
const clusterUrl = process.env.CLUSTER_URL;

const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

/**
 * getOneFromCollection is a example function for retrieving 
 * 
 * @param {string} database - database to retrieve from
 * @param {string} collection - collection to retrieve from
 * @param {Object} query - filter in format {"field" : value, etc.}
 * @returns {Promise<object | null>} Promise that resolves to object satisfying query or null
 */
async function getOneFromCollection(database, collection, query) {
  try {
    await client.connect();
    const db = client.db(database);
    const cl = db.collection(collection);
    const result = await cl.findOne(query);
    return result;
  } finally {
    await client.close();
  }
}

module.exports = { getOneFromCollection };