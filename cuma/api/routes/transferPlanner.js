import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
const router = express.Router();

const CLIENT = "CUMA";
const TRANSFER_PLAN_COLLECTION = "transferPlans";

async function getTransferPlanDBCollection(req) {
    const client = req.client;
    const database = client.db(CLIENT);
    const transferPlans = database.collection(TRANSFER_PLAN_COLLECTION);
    return transferPlans;
};

async function getUser(req) {
    // Get user's email
    const userEmail = getEmail(req);
    if (!userEmail) {
        return null;
    }
    // Fetch user's connections using the email from the users collection
    const db = req.client.db("CUMA");
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: userEmail });
    
    // Check if user exists, if not return 404
    if (!user) {
        return null;
    }
    // Add connections array to database if it doesn't exist
    if (!user.connections) {
        await usersCollection.updateOne({ email: userEmail }, { $set: { connections: [] } });
    }
    return user;
}

router.post('/create', authenticateToken, async (req, res) => {
    try {
        return await getUser(req).then(async (user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Access the MongoDB client from the request object
            const transferPlans =  getTransferPlanDBCollection(req);
            const { createPlannerForm } = req.body;

            // Check if the plan name exist
            const existingTransferPlan = await transferPlans.findOne({user: user.email, name: createPlannerForm.name});
            if(existingTransferPlan) {
                return res.status(400).json({ error: 'Transfer Plan already exists. Please create another name for the transfer plan.' });
            };

            // create and insert the new plan into db
            const newTransferPlan = {
                user: user.email,
                transferPlan: [ 
                    {
                        createAt: new Date(),
                        updatedAt: new Date(),
                        homeUniversity: "monash",
                        courseLevel: createPlannerForm.courseLevel,
                        course: createPlannerForm.course,
                        studyYear: createPlannerForm.studyYear,
                        studyPeriod: createPlannerForm.studyPeriod,
                        transferUniversity: createPlannerForm.transferUniversity,
                        name: createPlannerForm.planName
                    },
                ]
                    
            }
            await transferPlans.insertOne(newTransferPlan);

            // return successful message
            return res.status(201).json({
                message: 'New Transfer Plan created successfully',
                transferPlan: newTransferPlan.transferPlan,
            })
            
            
        });
        
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/getAll', authenticateToken, async (req, res) => {
    try {
        return await getUser(req).then(async (user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Access the MongoDB client from the request object
            const transferPlans =  getTransferPlanDBCollection();

            // Check if the plan name exist
            const existingTransferPlan = await transferPlans.findOne({user: user.email});
            if(existingTransferPlan && existingTransferPlan.transferPlan) {
                return res.status(201).json({
                    message: 'Successfully retrieve all transfer plan',
                    transferPlan: existingTransferPlan.transferPlan,
                })
                return res.status(400).json({ error: 'Transfer Plan already exists. Please create another name for the transfer plan.' });
            };

            // return successful message
            return res.status(201).json({
                message: 'New Transfer Plan created successfully',
                transferPlan: newTransferPlan.transferPlan,
            })
            
            
        });
        
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

