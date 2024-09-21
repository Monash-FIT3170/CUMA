
import express from "express";
const router = express.Router();
import fs from 'fs';
import gemini from '../../ai/geminiTest.js';

import { run } from '../../backend/webscraper.js';
import { threadId } from "worker_threads";
import { ObjectId } from "mongodb";

const collectionName = "testUnits";

router.post("/scrapeDomesticUnits", async (req, res) => {
    try {
      // Extract the source unit and comparison units from the request body
      const url = req.body.url;

      // const output = await run(url);

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
  const courseCode = jsonObject["courseCode"];
  const universtiyName = jsonObject["University"];

      // Access the MongoDB client from the request object
      const client = req.client;
      const database = client.db('CUMA');
    
    
      // get the collection
      const units = database.collection(collectionName);

      console.log(await units.updateOne({"unitCode": "MAT1830"}, {"$pop": {"course" : -1}}));

  try {

  

    // call gemini to create keywords for the unit
    // for (const [index, unit] in unitData){
    //     var thisUnit = unitData[index]

    //     const aiGenUnitKeyword = await gemini(thisUnit.unitDescription + JSON.stringify(thisUnit.learningOutomes))
    //     thisUnit["keywords"] = aiGenUnitKeyword
    // }


    // add the unit
    const result = await units.insertMany(unitData, { ordered: false });
    console.log(result)
    
    
    return result.writeErrors;

    
  
  }
  catch (error){
    if (error && error.writeErrors) {
      console.log(error)

      // if there is error in adding any error due to unique key error,
      // do a modify operation instead: append the course to unit.course instead of adding the unit itself.
      const failedUnits = error.writeErrors.map(writeError => writeError.getOperation().unitCode.toString());
      console.log(failedUnits)
      
      const unitsToModify = await units.find({
        "unitCode": { $in: failedUnits }, // Check if _id is in the array
        "universityName" : universtiyName, // check if univerisity Name is valid
        course: {
          $not: {
            $elemMatch: {
              courseCode: 'SFTWRENG01'
            }
          }
        }
      })

      console.log(universtiyName)
      


      // Loop through the unitsToModify array
    console.log("units to modify")
    unitsToModify.forEach(unit => {

      console.log(unit)

    });

  }
  }
  
  

  
  
  
  //   return res.status(200).json(result);
  // } catch (error) {
  //   // Handle errors
  //   console.error('Error:', error);
  //   res.status(500).json({ error: 'Internal server error' });
  // }
  
  

}






export default router;