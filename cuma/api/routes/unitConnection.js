// this file handles the api request for interacting with mongoDB
// database name: universities

import express from 'express';
const router = express.Router();

const collectionName = "testUnits"


router.post('/add', async (req, res) => {
    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        const database = client.db('CUMA');
        // const universities = database.collection('universities');
        const units = database.collection(collectionName);

        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = req.body;
        if (universityNameA == universityNameB && unitCodeA == unitCodeB) {
            return res.status(404).json({ error: 'Cannot add connection to self' });
        }

        // Check if unitCodes exists
        const unitA = await units.findOne({ universityName: universityNameA, "unitCode": unitCodeA });
        const unitB = await units.findOne({ universityName: universityNameB, "unitCode": unitCodeB });

        if (!unitA) {
            return res.status(404).json({ error: 'unitA not found' });
        }
        if (!unitB) {
            return res.status(404).json({ error: 'unitB not found' });
        }

        // Add connection to A
        const anyConnectionToB = await units.findOne({ universityName: universityNameA, "unitCode": unitCodeA, "connections": unitB._id });

        let numChanges = 0;
        if (!anyConnectionToB) {
            units.updateOne({ universityName: universityNameA, "unitCode": unitCodeA }, { $push: { "connections": unitB._id } });
            numChanges += 1;
        }

        // Add connection to B
        const anyConnectionToA = await units.findOne({ universityName: universityNameB, "unitCode": unitCodeB, "connections": unitA._id });

        if (!anyConnectionToA) {
            units.updateOne({ universityName: universityNameB, "unitCode": unitCodeB }, { $push: { "connections": unitA._id } });
            numChanges += 1;
        }

        res.json({ status: "Success", numberOfChanges: numChanges });
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
        const units = database.collection(collectionName);

        const { universityNameA, unitCodeA, universityNameB, unitCodeB } = req.body;

        // Check if unitCodes exists
        const unitA = await units.findOne({ universityName: universityNameA, "unitCode": unitCodeA });
        const unitB = await units.findOne({ universityName: universityNameB, "unitCode": unitCodeB });

        if (!unitA) {
            return res.status(404).json({ error: 'unitA not found' });
        }
        if (!unitB) {
            return res.status(404).json({ error: 'unitB not found' });
        }

        // Add connection to A
        const anyConnectionToB = await units.findOne({ universityName: universityNameA, "unitCode": unitCodeA, "connections": unitB._id });

        let numChanges = 0;
        if (anyConnectionToB) {
            units.updateOne({ universityName: universityNameA, "unitCode": unitCodeA }, { $pull: { "connections": { _id: unitB._id } } });
            numChanges += 1;
        }

        // Add connection to B
        const anyConnectionToA = await units.findOne({ universityName: universityNameB, "unitCode": unitCodeB, "connections": unitA._id });

        if (anyConnectionToA) {
            units.updateOne({ universityName: universityNameB, "unitCode": unitCodeB }, { $pull: { "connections": { _id: unitA._id } } });
            numChanges += 1;
        }

        res.json({ status: "Success", numberOfChanges: numChanges });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * Utility function to retrieve a unit from the database.
 * @param {object} collection - MongoDB collection object.
 * @param {string} universityName - The name of the university.
 * @param {string} unitCode - The code of the unit.
 * @returns {object|null} - The unit document or null if not found.
 */
async function findUnit(collection, universityName, unitCode) {
    return await collection.findOne({ universityName, unitCode });
}


/**
 * Utility function to retrieve unit connections.
 * @param {object} collection - MongoDB collection object.
 * @param {Array} connectionIds - Array of connection IDs.
 * @returns {Array} - Resolved connections.
 */
async function resolveConnections(collection, connectionIds) {
    return await collection.find({ _id: { $in: connectionIds } }).toArray();
}


/**
     * This endpoint retrieves the connections of a unit from a specific university
     *
     * URL param payloads:
     * universityName: str
     * unitCode: str
     *
     * Returns JSON response:
     * code: 200 - if no error
     * code: 400 - if missing parameters
     * code: 404 - if unit not found
     * code: 500 - if server error or other errors occurred
     */
router.get("/getAll", async (req, res) => {
    try {
        // Get the query parameters and check if they are provided
        const { sourceUni, unitCode } = req.query;
        if (!sourceUni || !unitCode) {
            return res.status(400).json({ error: "Both sourceUni and unitCode must be provided" });
        }

        // Access the MongoDB client from the request object and get the collection
        const client = req.client;
        const db = client.db("CUMA");
        const collection = db.collection(collectionName);

        // Find the unit in the collection
        const unit = await findUnit(collection, sourceUni, unitCode);

        if (!unit) {
            return res.status(404).json({ error: `University: ${sourceUni}, Unit: ${unitCode}, Not Found!` });
        }

        // Find connections of the unit and resolve them
        const connections = unit.connections;
        if (connections.length === 0) {
            return res.status(400).json({ error: `University: ${sourceUni}, Unit: ${unitCode}, does not have any connection!` });
        }
        const resolvedConnections = await resolveConnections(collection, connections);

        // Return the filtered connections
        return res.status(200).json({ connections: resolvedConnections });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


/**
    * This endpoint retrieves specific connections of a unit to a specific university
    *
    * URL param payloads:
    * sourceUni: str
    * unitCode: str
    * targetUni: str
    *
    * Returns JSON response:
    * code: 200 - if no error
    * code: 400 - if missing parameters
    * code: 404 - if any is not found
    * code: 500 - if server error or other errors occurred
    */
router.get("/getSpecific", async (req, res) => {
    try {
        // Get the query parameters and check if they are provided
        const { sourceUni, unitCode, targetUni } = req.query;
        if (!sourceUni || !unitCode || !targetUni) {
            return res.status(400).json({ error: "sourceUni, unitCode, and targetUni must be provided" });
        }

        // Access the MongoDB client from the request object and get the collection
        const client = req.client;
        const db = client.db("CUMA");
        const collection = db.collection(collectionName);

        // Find the unit in the collection
        const unit = await findUnit(collection, sourceUni, unitCode);
        if (!unit) {
            return res.status(404).json({ error: `University: ${sourceUni}, Unit: ${unitCode}, Not Found!` });
        }

        // Find connections of the unit and resolve them
        const connections = unit.connections;
        if (connections.length === 0) {
            return res.status(404).json({ error: `University: ${sourceUni}, Unit: ${unitCode}, does not have any connection!` });
        }
        const resolvedConnections = await resolveConnections(collection, connections);

        // Filter the connections by targetUni and check if any connections exist
        const filteredConnections = resolvedConnections.filter(connection => connection.universityName === req.query.targetUni);
        if (!filteredConnections) {
            return res.status(404).json({ error: `University: ${sourceUni}, Unit: ${unitCode}, Target University: ${req.query.targetUni} has no connection!` });
        }

        // Return the filtered connections
        return res.status(200).json({ connections: filteredConnections });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


export default router;
