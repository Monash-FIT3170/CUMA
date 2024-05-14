/**
 * this file handles the api request for interacting with mongoDB
 * database name: units
 * API pathname: /api/unit
 * 
 */

import express from 'express';
const router = express.Router();

const collectionName = "testUnits";

router.get('/getAllFromUni', async (req, res) => {
    /**
     * This endpoint retrieves all the units available in a university
     * 
     * url param payloads = {
     *   universityName: str
     * }
     * 
     * returns json response = 
     * code: 200 - if no error
     * code: 500 - if server error or other errors occured
     *  
     */
    
    try {
        // get the client
        const client = req.client;

        // get the request url params 
        const params = req.query;

        console.log(params);

        //get the database and the collection
        const database  = client.db("CUMA");
        const units = database.collection(collectionName);

        //get all the units
        const allUnits = await units.find(params);
        const result = await allUnits.toArray()
        return res.json(result);

    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal Server Error");
    }


})

router.post('/', async (req, res) => {
    /**
     * This endpoint inserts a unit into the database.
     * 
     *  requestbody payload = {
            "universityName": str, 
            "unitInfo": {
                "unitCode": "str",
                "unitName": "str",
                "unitDescription": "str",
                "unitType": "int",
                "unitLevel": "int",
                "creditPoints": "int",
            }
        }
     *
     * returns json response: 
     * code: 400 - if the university does not exist. Or if the unit already exists in the university (duplicates)
     * code: 200 - if successful
     * code: 500 - if server error or other errors occured
     */


    try {
        // Access the MongoDB client from the request object
        const client = req.client;
        const database = client.db('CUMA');
        
        // get request payload
        const query = req.body;
        const universityNameReq = query.universityName;
        const unitInfoReq = query.unitInfo;
  
        // get the collection
        const units = database.collection(collectionName);


        // check if the unit in the university already exists
        const unit = await units.findOne({"unitCode": unitInfoReq.unitCode, "universityName": universityNameReq });

        // if unit already exists, return error
        if (unit)
        {
            return res.status(400).json("unit already exists")
        }

        // add the unit
        const result = await units.insertOne(
            {"universityName": universityNameReq, 
            ...unitInfoReq}
        )
        return res.status(200).json(result)

    
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.get('/retrieveUnit',async (req,res) => {
    /**
      This endpoint retrieves a unit from a specific university
      
     url param payloads = {
        universityName: str
        unitCode: str
      }
      
      returns json response = 
      code: 200 - if no error
      code: 500 - if server error or other errors occured
     **/
    try {
        const client = req.client;
        const {universityName, unitCode} = req.query;

        if (!universityName || !unitCode){
            return res.status(400).json({ error: "Both university and unitcode must be provided" });
        }

        const db = client.db('CUMA');
        const collection = db.collection('units');

        const unit = await collection.findOne({universityName: universityName, unitCode: unitCode});

        if (unit){
            res.json(unit);
        }else{
            res.status(404).json({error: `University: ${universityName}, Unit: ${unitCode}, Not Found!`});
        }

    }catch{
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// router.get('/:id', (req, res) => {
//     // Handle GET request to retrieve data by ID
// });

// router.post('/', (req, res) => {
//     // Handle POST request to add new data
// });

// router.put('/:id', (req, res) => {
//     // Handle PUT request to update data by ID
// });

// router.delete('/:id', (req, res) => {
//     // Handle DELETE request to delete data by ID
// });

export default router;
