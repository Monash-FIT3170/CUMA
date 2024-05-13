"use strict";

const fs = require('fs').promises;  
const { MongoClient } = require('mongodb');
require('dotenv').config({ override: true });

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

async function populateSoftEngDB() {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('units');
        // await collection.deleteMany({}) // test re-inputting data and see if it updates, duplicates or prevents
        const data = await extractJson('cuma/webscraping/unitData.json');

        for (let i = 0; i < data.units.length; i++) {
            const unit = data.units[i];
            const unitCollection =  {
                "universityName": data.University,
                "unitCode": unit.unitCode,
                "unitName": unit.unitName,
                "unitDescription": unit.unitDescription,
                "unitType": "",
                "unitLevel": unit.unitLevel,
                "creditPoints": unit.creditPoints,
                "course": [{
                    "courseCode": data.courseCode,
                    "courseName": data.CourseTitle
                }],
                "faculty": unit.faculty,
                "offering": unit.offerings,
                "handBookURL": unit.handbookURL,
                "connection": []
            };
            
            await collection.insertOne(unitCollection);
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}

populateSoftEngDB();
