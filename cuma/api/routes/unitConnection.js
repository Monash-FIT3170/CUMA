// this file handles the api request for interacting with mongoDB
// database name: universities

import express from 'express';
const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        const database = client.db('CUMA');
        const universities = database.collection('universities');

        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = req.body;
        if (universityNameA == universityNameB && unitCodeA == unitCodeB) {
            return res.status(404).json({ error: 'Cannot add connection to self'});
        }

        // Check if universities and unitCode exists
        const universityA = await universities.findOne({universityName: universityNameA, "units.unitCode": unitCodeA});
        const universityB = await universities.findOne({universityName: universityNameB, "units.unitCode": unitCodeB});

        if (!universityA) {
            return res.status(404).json({ error: 'universityA not found'});
        }
        if (!universityB) {
            return res.status(404).json({ error: 'universityB not found' });
        }

        // Add connection to A
        const newConnectionAtoB = { universityName: universityNameB, unitCode: unitCodeB};
        const filterAtoB = { universityName: universityNameA, "units.unitCode": unitCodeA };
        const updateAtoB = {$push: { "units.$.connection": newConnectionAtoB} };
        const existingConnectionA = await universities.findOne({ universityName: universityNameA, "units.unitCode": unitCodeA, "units.connection.universityName": universityNameB, "units.connection.unitCode": unitCodeB });

        let numChanges = 0;
        if (!existingConnectionA) {
            universities.updateOne(filterAtoB, updateAtoB);
            numChanges += 1;
        }
        
        // Add connection to B
        const newConnectionBtoA = { universityName: universityNameA, unitCode: unitCodeA};
        const filterBtoA = { universityName: universityNameB, "units.unitCode": unitCodeB };
        const updateBtoA = {$push: { "units.$.connection": newConnectionBtoA} };
        const existingConnectionB = await universities.findOne({ universityName: universityNameB, "units.unitCode": unitCodeB, "units.connection.universityName": universityNameA, "units.connection.unitCode": unitCodeA });

        if (!existingConnectionB) {
            universities.updateOne(filterBtoA, updateBtoA);
            numChanges += 1;
        }

        res.json({status : "Success", numberOfChanges: numChanges });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/delete', async (req, res) => {
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
            return res.status(404).json({ error: 'universityA not found'});
        }
        if (!universityB) {
            return res.status(404).json({ error: 'universityB not found' });
        }

        // Add connection to A
        const connectionAtoB = { universityName: universityNameB, unitCode: unitCodeB };
        const filterAtoB = { universityName: universityNameA, "units.unitCode": unitCodeA };
        const pullAtoB = { $pull: { "units.$.connection": connectionAtoB } };
        const existingConnectionA = await universities.findOne({ universityName: universityNameA, "units.unitCode": unitCodeA, "units.connection.universityName": universityNameB, "units.connection.unitCode": unitCodeB });

        let numChanges = 0;
        if (existingConnectionA) {
            universities.updateOne(filterAtoB, pullAtoB);
            numChanges += 1;
        }
        
        // Add connection to B
        const connectionBtoA = { universityName: universityNameA, unitCode: unitCodeA};
        const filterBtoA = { universityName: universityNameB, "units.unitCode": unitCodeB };
        const pullBtoA= { $pull: { "units.$.connection": connectionBtoA } };
        const existingConnectionB = await universities.findOne({ universityName: universityNameB, "units.unitCode": unitCodeB, "units.connection.universityName": universityNameA, "units.connection.unitCode": unitCodeA });

        if (existingConnectionB) {
            universities.updateOne(filterBtoA, pullBtoA);
            numChanges += 1;
        }

        res.json({status : "Success", numberOfChanges: numChanges });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;