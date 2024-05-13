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
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('CUMA');
        const collection = db.collection('universities');
        await collection.deleteMany({})
        const data = await extractJson('cuma/webscraping/unitData.json');

        const emptyUniversity = {
            "universityName": data.University,
            "faculties": [data.units[0].faculty],
            "units": []
        };

        await collection.insertOne(emptyUniversity);

        for (let i = 0; i < data.units.length; i++) {
            const unit = data.units[i];
            const unitCollection =  {
                "unitCode": unit.unitCode,
                "unitName": unit.unitName,
                "unitDescription": unit.unitDescription,
                "unitType": "",
                "unitLevel": unit.unitLevel,
                "creditPoints": unit.creditPoints,
                "course": [{
                    "courseCode": data.courseCode,
                    "courseTitle": data.CourseTitle
                }],
                "faculty": unit.faculty,
                "offering": unit.offerings,
                "handBookURL": unit.handbookURL,
                "connection": []
            };
            
            await collection.updateOne(
                {"universityName": data.University},
                { $push: { "units": unitCollection }}
            );
        }
    } catch (error) {
        console.error(`An error occured while inserting data: ${error}`);
    } finally {
        await client.close();
    }
}

populateSoftEngDB();
