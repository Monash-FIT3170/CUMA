"use strict";

const { MongoClient } = require('mongodb');
require('dotenv').config({ override: true });
const client = new MongoClient(process.env.MONGODB_URI);

async function lookForUniqueIndexes(collectionName) {
    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection(collectionName);

        const indexes = await collection.indexInformation();
        console.log(indexes);
    } catch (error) {
        console.error(`An error occured: ${error}`);
    } finally {
        await client.close();
    }
}

async function duplicate(originalCollection, duplicateCollection) {
    try {
        await client.connect();
        const db = client.db('CUMA');
        await db.collection(duplicateCollection).deleteMany({});

        // Duplicate the collection
        const cursor = db.collection(originalCollection).aggregate([
            { $match: {} },
            { $merge: { into: duplicateCollection } }
        ]);

        // Exhaust the cursor to ensure $merge takes effect
        await cursor.forEach(() => {});
    } catch (error) {
        console.error(`An error occured while duplicating data: ${error}`);
    } finally {
        await client.close();
    }
}

duplicate("units", "testUnits").catch(console.error);
// lookForUniqueIndexes("units");
