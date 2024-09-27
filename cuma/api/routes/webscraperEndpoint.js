import express from "express";
const router = express.Router();
import fs from 'fs';
import gemini from '../../ai/geminiTest.js';
import { run} from "../../backend/webscraper.js";

const collectionName = "testUnits";

router.post("/scrapeDomesticUnits", async (req, res) => {
    try {
      // Extract the source unit and comparison units from the request body
      const url = req.body.url;

      const output = await run(url, res);

      const result = await addToDatabase(req, output);
      
      res.write(JSON.stringify(result));

      res.end()
    } catch (error) {
      console.error(error);
      return res.status(500).json("Internal Server Error");
    }

});


async function addToDatabase(req, data) {
  const returnResults = {
    "unitsAdded": null,
    "unitsModified": null,
    "unitsUnchanged": null
  };

  // Read from unitdata.json
  // const data = fs.readFileSync('./unitData.json', 'utf8');
  // console.log(data)
  const jsonObject = JSON.parse(data);
  
  // Prepare data
  const unitData = jsonObject["units"];
  const courseCode = jsonObject["courseCode"];
  const universityName = jsonObject["University"]; 
  const courseData = {
    courseCode: courseCode,
    courseName: jsonObject["CourseTitle"]
  };

  // Access the MongoDB client from the request object
  const client = req.client;
  const database = client.db('CUMA');
  
  // Get the collection
  const units = database.collection(collectionName);


  // for testing purposes only
  // console.log(await units.updateOne(
  //   { "unitCode": "MAT1830" }, 
  //   { "$set": { "course": [] } }
  // ));

  // console.log(await units.deleteMany({
  //   "unitCode": {"$in" : [
  //   'MAT1830', 'FIT2004', 'FIT2085', 'FIT2099',
  //   'FIT2100', 'FIT2101', 'FIT2107', 'FIT3077',
  //   'FIT3159', 'FIT3170', 'FIT3171', 'FIT4165',
  //   'FIT4002', 'FIT4701', 'FIT4702', 'FIT4042',
  //   'ENG0001', 'ENG0002', 'FIT3003', 'FIT3031',
  //   'FIT3080', 'FIT3094', 'FIT3134', 'FIT3138',
  //   'FIT3139', 'FIT3143', 'FIT3146', 'FIT3152',
  //   'FIT3155', 'FIT3168', 'FIT3169', 'FIT3173',
  //   'FIT3175', 'FIT3176', 'FIT3178', 'FIT3179',
  //   'FIT3182', 'FIT3183', 'FIT4005', 'FIT5003',
  //   'FIT5032', 'FIT5037', 'FIT5046', 'FIT5124',
  //   'FIT5129', 'FIT5137', 'FIT5145', 'FIT5163',
  //   'FIT5201', 'FIT5202', 'FIT5215', 'FIT5216',
  //   'FIT5217', 'FIT5221', 'FIT5222', 'FIT5223',
  //   'FIT5225'
  // ]}
  // }))

  try {

    // for (const [index, unit] of unitData.entries()) {
    //     const aiGenUnitKeyword = await gemini(unit.unitDescription + JSON.stringify(unit.learningOutcomes));
    //     unit["keywords"] = aiGenUnitKeyword;
    // }

    // Add the units
    const result = await units.insertMany(unitData, { ordered: false });

    // Return results
    returnResults.unitsAdded = result.insertedCount;
    returnResults.unitsModified = 0;
    returnResults.unitsUnchanged = 0;


  } catch (error) {
    if (error && error.writeErrors) {


      // Handle unique key errors
      const failedUnits = error.writeErrors.map(writeError => writeError.getOperation().unitCode.toString());
      
      // Define the filter for existing units
      const filter = {
        "unitCode": { $in: failedUnits }, // Check if unitCode is in the array of failedUnits
        "universityName": universityName, // Check if universityName is valid
        course: {
          $not: {
            $elemMatch: {
              courseCode: courseCode // Ensure no element in course array has courseCode
            }
          }
        }
      }; // Check if unit is already part of the course
      
      // Update data
      const update = {
        "$push": { "course": courseData }
      };


      // Update the units that already exist
      const modifyResult = await units.updateMany(filter, update); // Await the updateMany
    
      // Prepare the return result after the update
      returnResults.unitsAdded = error.result.insertedCount
      returnResults.unitsModified = modifyResult.modifiedCount; // Capture modified count
      returnResults.unitsUnchanged = modifyResult.matchedCount - modifyResult.modifiedCount; // Calculate unchanged units

    }



  }

  return returnResults;
}



  


  
  
  
  //   return res.status(200).json(result);
  // } catch (error) {
  //   // Handle errors
  //   console.error('Error:', error);
  //   res.status(500).json({ error: 'Internal server error' });
  // }
  
  






export default router;