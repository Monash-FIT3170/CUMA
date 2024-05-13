const { getOneFromCollection, insertOneToCollection, createUser } = require('./database/db_access.js');

// // Sample retrieval of data
// const dbName = "sample_mflix";
// const collectionName = "movies";
// const query = { title: 'Back to the Future' };

// getOneFromCollection(dbName, collectionName, query)
//   .then(result => console.log(result));

// // Sample insertion of data
// const dbName = "sample_mflix";
// const collectionName = "movies";
// const document = { title: "El Camino: A Breaking Bad Movie", director: 'Vince Gilligan', year: 2019 };
// insertOneToCollection(dbName, collectionName, document);

// // Sample create user
// const username = "testUsername";
// const password = "fakePass";
// const role = "fakeRole";
// const admin = false;
// const emailVerified = false;

// createUser(username, password, role, admin, emailVerified)
//   .then(result => console.log(result));