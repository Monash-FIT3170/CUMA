"use strict";

const fs = require('fs').promises;  
const { connect } = require('http2');
const { MongoClient, ObjectId } = require('mongodb');
const { connections } = require('mongoose');
require('dotenv').config({ override: true });
const client = new MongoClient(process.env.MONGODB_URI);

/*
Read a json file and return the parsed data.
*/
async function extractJson(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const items = JSON.parse(data);
        
        // Test extracting and printing JSON to console
        // console.log(JSON.stringify(items, null, 2));

        return items;
    } catch (error) {
         console.log(error);
    }
}

/*
Populate the database with units from the webscraped software engineering data.
*/
async function populateSoftEngDB() {
    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('units');
        // await collection.deleteMany({})
        const unitData = await extractJson('cuma/webscraping/unitData.json');

        for (let i = 0; i < unitData.units.length; i++) {
            const unit = unitData.units[i];
            const unitCollection =  {
                "universityName": unitData.University,
                "unitCode": unit.unitCode,
                "unitName": unit.unitName,
                "unitDescription": unit.unitDescription,
                "unitType": "",
                "unitLevel": unit.unitLevel,
                "creditPoints": unit.creditPoints,
                "course": [{
                    "courseCode": unitData.courseCode,
                    "courseName": unitData.CourseTitle
                }],
                "faculty": unit.faculty,
                "offering": unit.offerings,
                "handBookURL": unit.handbookURL,
                "connections": []
            };
            
            await collection.insertOne(unitCollection);
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}

/*
Add dummy units to database
*/
async function addDummyUnits() {
    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('units');
        const dummyData = await extractJson('cuma\\database\\dummyData.json');

        await collection.deleteMany({
            universityName: {
                $in: ["Test University A", "Test University B", "Test University C"]
            }
        });

        await collection.deleteMany({
            unitCode: {
                $in: ["ABC123", "ABC456"]
            }
        });

        // for (let i = 0; i < dummyData.dummyUnits.length; i++) {
        //     await collection.insertOne(dummyData.dummyUnits[i]);
        // }

        await collection.insertMany(dummyData.dummyUnits);
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}





/*
Add unit connections between units.
Used when adding a connection to unitOne for unitTwo.
*/
async function addUnitConnection(universityOne, unitCodeOne, universityTwo, unitCodeTwo) {
    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('units');

        const unitTwo = await collection.findOne({
            universityName: universityTwo,
            unitCode: unitCodeTwo
        });

        if (unitTwo) {
            const unitOne = await collection.findOneAndUpdate(
                { universityName: universityOne, unitCode: unitCodeOne },
                { $addToSet: { connections: unitTwo._id } },
                { returnDocument: 'after'}
            );

            await collection.updateOne(
                { universityName: universityTwo, unitCode: unitCodeTwo },
                { $addToSet: { connections: unitOne._id } }
            );
        } else {
            console.log(`Unit: ${unitCodeTwo}, University: ${universityTwo}, Not Found!`);
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}

/*
Remove unit connections between units.
Can be done from either unitOne or unitTwo.
*/
async function removeUnitConnection(universityOne, unitCodeOne, universityTwo, unitCodeTwo) {
    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('units'); 

        const unitTwo = await collection.findOne({
            universityName: universityTwo,
            unitCode: unitCodeTwo
        });

        if (unitTwo) {
            const unitOne = await collection.findOneAndUpdate(
                { universityName: universityOne, unitCode: unitCodeOne },
                { $pull: { connections: unitTwo._id } },
                { returnDocument: 'after'}
            );

            await collection.updateOne(
                { universityName: universityTwo, unitCode: unitCodeTwo },
                { $pull: { connections: unitOne._id } }
            );
        } else {
            console.log(`Unit: ${unitCodeTwo}, University: ${universityTwo}, Not Found!`);
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}

/*
Retrieve a unit.
*/
async function retrieveOneUnit(university, unitCode) {
    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('units');

        const unit = await collection.findOne({
            universityName: university,
            unitCode: unitCode
        });

        if (unit) {
            // console.log(unit)
            return unit;
        } else {
            console.log(`University: ${university}, Unit: ${unitCode}, Not Found!`);
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}

/*
List all connections of a unit.
*/
async function listConnections(university, unitCode) {
    const unit = await retrieveOneUnit(university, unitCode);

    if (unit) {
        const connections = unit.connections;

        try {
            await client.connect();
            const db = client.db('CUMA');
            const collection = db.collection('units');
            let unitConnections = [];

            for (let i = 0; i < connections.length; i++) {
                const connectedUnit = await collection.findOne({
                    _id: connections[i]
                });

                if (connectedUnit) {
                    unitConnections.push(connectedUnit);
                }
            }

            return unitConnections;
        } catch (error) {
            console.error(`An error occured while inserting data: ${error}`);
        } finally {
            await client.close();
        }
    }
}





/*
Add dummy connections.
*/
async function addDummyConnections() {
    // await addUnitConnection("Monash", "FIT3170", "_Test University A", "ABC123") // should not work
    // await addUnitConnection("Monash", "FIT3170", "Test University A", "_ABC123") // should not work
    // await addUnitConnection("Monash", "FIT3170", "_Test University A", "_ABC123") // should not work
    await addUnitConnection("Monash", "FIT3170", "Test University A", "ABC123") // should work
    await addUnitConnection("Monash", "FIT3170", "Test University C", "DEF456") // should work
    await addUnitConnection("Test University B", "ABC123", "Monash", "FIT3170") // should work
}

async function run() {
    // await addDummyConnections();
    await retrieveOneUnit("Monash", "FIT3170").then(data => console.log(data));
    await addUnitConnection("Monash", "FIT3170", "Test University A", "DEF456");
    await retrieveOneUnit("Monash", "FIT3170").then(data => console.log(data));
    await removeUnitConnection("Monash", "FIT3170", "Test University A", "DEF456");
    await retrieveOneUnit("Monash", "FIT3170").then(data => console.log(data));
    await listConnections("Monash", "FIT3170").then(data => console.log(data));
}

run();
