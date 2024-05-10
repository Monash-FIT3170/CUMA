// this file handles the api request for interacting with mongoDB
// database name: UNIT

import express from 'express';
const router = express.Router();

// Example route handler accessing the client
router.get('/', async (req, res) => {
    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        await client.connect()

        // const database = client.db('sample_mflix');
        // const movies = database.collection('movies');
        // // Query for a movie that has the title 'Back to the Future'
        // const query = { title: 'Back to the Future' };
        // const movie = await movies.findOne(query);

        const collections  = client.listCollections().toArray();

        // Extract collection names from the collections array
        const collectionNames = collections.map(collection => collection.name);
        
        // Send collection names as the response
        res.json(collectionNames);

        res.send(movie)
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', (req, res) => {
    // Handle GET request to retrieve data by ID
});

router.post('/', (req, res) => {
    // Handle POST request to add new data
});

router.put('/:id', (req, res) => {
    // Handle PUT request to update data by ID
});

router.delete('/:id', (req, res) => {
    // Handle DELETE request to delete data by ID
});

export default router;
