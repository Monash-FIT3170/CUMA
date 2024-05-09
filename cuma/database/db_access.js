const { MongoClient } = require('mongodb');

require('dotenv').config({ override: true })

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI);

/**
 * getOneFromCollection is a example function for retrieving 
 * 
 * @param {string} database - database to retrieve from
 * @param {string} collection - collection to retrieve from
 * @param {Object} query - filter in format {"field" : value, etc.}
 * @returns {Promise} Promise that resolves to object satisfying query or null
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

/**
 * insertOneToCollection is a function for inserting a document into a collection (if not already existing)
 * 
 * @param {string} database - database to insert into
 * @param {string} collection - collection to insert into
 * @param {Object} document - document to insert
 * @returns {Promise} Promise that resolves when the document is inserted
 */
async function insertOneToCollection(database, collection, document) {
  try {
    await client.connect();
    const db = client.db(database);
    const cl = db.collection(collection);
    const existingDocument = await cl.findOne(document);
    if (!existingDocument) {
      await cl.insertOne(document);
    }
  } finally {
    await client.close();
  }
}

module.exports = { getOneFromCollection, insertOneToCollection };
