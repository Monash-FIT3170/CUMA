// this file handles the api request for interacting with mongoDB
// database name: universities

import express from 'express';
const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        const database = client.db('CUMA');
        // const universities = database.collection('universities');
        const units = database.collection('units');

        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = req.body;
        if (universityNameA == universityNameB && unitCodeA == unitCodeB) {
            return res.status(404).json({ error: 'Cannot add connection to self'});
        }

        // Check if unitCodes exists
        const unitA = await units.findOne({universityName: universityNameA, "unitCode": unitCodeA});
        const unitB = await units.findOne({universityName: universityNameB, "unitCode": unitCodeB});

        if (!unitA) {
            return res.status(404).json({ error: 'unitA not found'});
        }
        if (!unitB) {
            return res.status(404).json({ error: 'unitB not found' });
        }

        // Add connection to A
        const anyConnectionToB = await units.findOne({ universityName: universityNameA, "unitCode": unitCodeA, "connection._id": unitB._id });

        let numChanges = 0;
        if (!anyConnectionToB) {
            units.updateOne({universityName: universityNameA, "unitCode": unitCodeA}, { $push: { "connection": {_id : unitB._id }} });
            numChanges += 1;
        }
        
        // Add connection to B
        const anyConnectionToA = await units.findOne({ universityName: universityNameB, "unitCode": unitCodeB, "connection._id": unitA._id });

        if (!anyConnectionToA) {
            units.updateOne({universityName: universityNameB, "unitCode": unitCodeB}, { $push: { "connection":{ _id : unitA._id } } });
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
        // const universities = database.collection('universities');
        const units = database.collection('units');

        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = req.body;

        // Check if unitCodes exists
        const unitA = await units.findOne({universityName: universityNameA, "unitCode": unitCodeA});
        const unitB = await units.findOne({universityName: universityNameB, "unitCode": unitCodeB});

        if (!unitA) {
            return res.status(404).json({ error: 'unitA not found'});
        }
        if (!unitB) {
            return res.status(404).json({ error: 'unitB not found' });
        }

        // Add connection to A
        const anyConnectionToB = await units.findOne({ universityName: universityNameA, "unitCode": unitCodeA, "connection._id": unitB._id });

        let numChanges = 0;
        if (anyConnectionToB) {
            units.updateOne({universityName: universityNameA, "unitCode": unitCodeA}, { $pull: { "connection": {_id : unitB._id }} });
            numChanges += 1;
        }
        
        // Add connection to B
        const anyConnectionToA = await units.findOne({ universityName: universityNameB, "unitCode": unitCodeB, "connection._id": unitA._id });

        if (anyConnectionToA) {
            units.updateOne({universityName: universityNameB, "unitCode": unitCodeB}, { $pull: { "connection" : { _id : unitA._id } } });
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