// this file handles the api request for interacting with mongoDB
// database name: universities

import express from 'express';
const router = express.Router();

// Example route handler accessing the client
router.post('/', async (req, res) => {
    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        const database = client.db('CUMA');
        const universities = database.collection('universities');

        const { universityFrom, unitcodeFrom, universityTo, unitcodeTo } = req.body;
        // Check if universities and unitcode exists
        const fromUniversity = await universities.findOne({universityName: universityFrom, "units.unitCode": unitcodeFrom});
        const toUniversity = await universities.findOne({universityName: universityTo, "units.unitCode": unitcodeTo});
        if (!fromUniversity) {
            return res.status(404).json({ error: 'universityFrom not found'});
        }
        if (!toUniversity) {
            return res.status(404).json({ error: 'universityTo not found' });
        }

        const newConnection = { universityName: universityTo, unitcode: unitcodeTo};

        const filter = { universityName: universityFrom, "units.unitCode": unitcodeFrom };
        const update = {$push: { "units.$.connection": newConnection} };
        const addition = await universities.updateOne(filter, update);
        
        // Send the inserted data as the response
        res.json(addition);
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;


