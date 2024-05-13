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

        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = req.body;

        // Check if universities and unitCode exists
        const universityA = await universities.findOne({universityName: universityNameA, "units.unitCode": unitCodeA});
        const universityB = await universities.findOne({universityName: universityNameB, "units.unitCode": unitCodeB});

        if (!universityA) {
            return res.status(404).json({ error: 'universityFrom not found'});
        }
        if (!universityB) {
            return res.status(404).json({ error: 'universityTo not found' });
        }

        // Add connection to A
        const newConnectionAtoB = { universityName: universityNameB, unitCode: unitCodeB};
        const filterAtoB = { universityName: universityNameA, "units.unitCode": unitCodeA };
        const updateAtoB = {$push: { "units.$.connection": newConnectionAtoB} };
        const existingConnectionA = await universities.findOne({ universityName: universityNameA, "units.unitCode": unitCodeA, "units.connection.universityName": universityNameB, "units.connection.unitCode": unitCodeB });

        if (!existingConnectionA) {
            universities.updateOne(filterAtoB, updateAtoB);
        }
        
        // Add connection to B
        const newConnectionBtoA = { universityName: universityNameA, unitCode: unitCodeA};
        const filterBtoA = { universityName: universityNameB, "units.unitCode": unitCodeB };
        const updateBtoA = {$push: { "units.$.connection": newConnectionBtoA} };
        const existingConnectionB = await universities.findOne({ universityName: universityNameB, "units.unitCode": unitCodeB, "units.connection.universityName": universityNameA, "units.connection.unitCode": unitCodeA });

        if (!existingConnectionB) {
            universities.updateOne(filterBtoA, updateBtoA);
        }

        res.json({status : "Success"});
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;


