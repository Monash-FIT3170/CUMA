// this file handles the api request for interacting with mongoDB
// database name: UNIT

import express from 'express';
const router = express.Router();

const collectionName = "testUnits";

router.post('/', async (req, res) => {
    /*request payload = {
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
    */

    /**
     * return: 
     * code: 400 - if the university does not exist or if the unit already exists in the university (duplicates)
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
        const result = await units.insertOne({"universityName": universityNameReq, unitInfoReq})
        return res.json(result)

    
    } catch (error) {
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
