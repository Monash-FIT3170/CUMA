"use strict";

const fs = require('fs').promises;  
const { MongoClient } = require('mongodb');
require('dotenv').config({override: true});

const client = new MongoClient(process.env.MONGODB_URI);

async function extractJson(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const items = JSON.parse(data);
        
        // Test extracting and printing JSON to console
        // console.log(JSON.stringify(items, null, 2));

        
    } catch (error) {
         console.log(error);
    }
}

async function populate() {

}

extractJson('cuma/webscraping/unitData.json');
