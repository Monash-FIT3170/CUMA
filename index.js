const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
require('dotenv').config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const clusterUrl = process.env.CLUSTER_URL;

const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&writeConcern=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const movies = database.collection('movies');
    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);
    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

