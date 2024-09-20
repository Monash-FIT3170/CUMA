
import express from "express";
const router = express.Router();
import fs from 'fs';
import gemini from '../../ai/geminiTest.js';

import { run } from '../../backend/webscraper.js';
import { threadId } from "worker_threads";

const collectionName = "testUnits";

router.post("/scrapeDomesticUnits", async (req, res) => {
    try {
      // Extract the source unit and comparison units from the request body
      const url = req.body.url;

      // const output = await run(url);
      const output = 1

      const result = await addToDatabase(req, res);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json("Internal Server Error");
    }
});

async function addToDatabase(req){
  // read from unitdata.json
  const data = fs.readFileSync('./unitData.json', 'utf8');

  const jsonObject = JSON.parse(data);
  // Prepare data
  const unitData = jsonObject["units"];


  try {
    // Access the MongoDB client from the request object
    const client = req.client;
    const database = client.db('CUMA');
  
    console.log("here")
  
    // get the collection
    const units = database.collection(collectionName);
  

    // call gemini to create keywords for the unit
    // for (const [index, unit] in unitData){
    //     var thisUnit = unitData[index]

    //     const aiGenUnitKeyword = await gemini(thisUnit.unitDescription + JSON.stringify(thisUnit.learningOutomes))
    //     thisUnit["keywords"] = aiGenUnitKeyword
    // }

    console.log(unitData)

    // add the unit
    const result = await units.insertMany(unitData, { ordered: false });
    
    return result;
  
  }
  catch (error){
    console.log(error);
  }
  
  

  
  
  
  //   return res.status(200).json(result);
  // } catch (error) {
  //   // Handle errors
  //   console.error('Error:', error);
  //   res.status(500).json({ error: 'Internal server error' });
  // }
  
  

}







export default router;