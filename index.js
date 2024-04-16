const { getOneFromCollection } = require('./db_access.js');

// Sample retrieval of data
const dbName = "sample_mflix";
const collectionName = "movies";
const query = { title: 'Back to the Future' };

getOneFromCollection(dbName, collectionName, query)
  .then(result => console.log(result));