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



/*
Function Purpose:
. Read and Process user input from text fields
. package into json obj
. query DB on unit information and any connections
. perform post processing (if necessary) and return for front end to display

Currently no input. However, if we can refactor the "onSearchEvent" of the search
bar to call this function with its currently contained data that would be cool...

*/
function getUnitInfo(){

	//Get search bar element
	searchBar = document.getElementById("searchBar")
	query = {"unitCode": searchBar.innerText.strip()}

	//query DB
	//data = getOneFromCollection(database, collection, query)

	// process data into output ...
	/*formattedData = {
		unitCode: ...,
		unitDescription: ...,
		creditPoints: ...,
		assessmentStructure: ...
		
	}
	*/


	//return formattedData
}