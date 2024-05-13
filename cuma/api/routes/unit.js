// this file handles the api request for interacting with mongoDB
// database name: UNIT

import express from 'express';
const router = express.Router();


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
  

        // // get the collection
        // const universities = database.collection('testUniversities');


        // // check if the unit already exists
        // const university = await universities.findOne({ universityName: universityNameReq });

        // if (!university) {
        //     // error: no university found
        //     return res.status(400).json({ error: "University does not exist" });
        // } else {
        //     // Check if unit with the same unitcode exists in the university.units array
        //     const unitExists = university.units.some(unit => unit.unitCode == unitInfoReq.unitCode);

            
        //     if (unitExists) {
        //         // error: unit with the unitcode already exists
        //         return res.status(400).json({ error: "Unit is a duplicate" });
        //     }
        // }

        // // add the unit 
        // universities.updateOne(
        //     { name: universityNameReq },
        //     { $push: { units: unitInfoReq } },
            
        //     (err, result) => {
        //         if (err) {
        //             console.error('Error updating university document:', err);
        //         } else {

        //             // Send the inserted data as the response
                   
    
        //             if (result.modifiedCount === 1) {
        //                 console.log(`Unit ${unitToAppend.unitcode} appended to ${universityNameReq} successfully.`);
        //             } else {
        //                 console.log(`University ${universityNameReq} not found or no changes made.`);
        //             }
        //         }

                
        //     }
        // );

        // res.json({message: "result"});

    
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
