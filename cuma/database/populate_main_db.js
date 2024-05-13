"use strict";

const fs = require('fs').promises;  
const { MongoClient } = require('mongodb');
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

        for (let i = 0; i < dummyData.dummyUnits.length; i++) {
            await collection.insertOne(dummyData.dummyUnits[i]);
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}



addDummyUnits();
