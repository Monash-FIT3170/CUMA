// this file handles the api request for interacting with mongoDB
// database name: UNIT

import express from 'express';
const router = express.Router();

// Example route handler accessing the client
router.post('/', async (req, res) => {
    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        const database = client.db('CUMA');
        const units = database.collection('units');

        console.log(req)
        // add to units
        const query = req.query; // Assuming you're sending data in the request body
        const addition = await units.insertOne(query);
        
        // Send the inserted data as the response
        res.json(addition);
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// router.get('/:id', (req, res) => {
//     // Handle GET request to retrieve data by ID
// });

// router.post('/', (req, res) => {
//     // Handle POST request to add new data
// });

// router.put('/:id', (req, res) => {
//     // Handle PUT request to update data by ID
// });

// router.delete('/:id', (req, res) => {
//     // Handle DELETE request to delete data by ID
// });

export default router;
