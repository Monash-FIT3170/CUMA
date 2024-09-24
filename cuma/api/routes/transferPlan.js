import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
const router = express.Router();

const CLIENT = "CUMA";
const TRANSFER_PLAN_COLLECTION = "transferPlans";

async function getTransferPlanDBCollection(req) {
  const client = req.client;
  const database = client.db(CLIENT);
  return database.collection(TRANSFER_PLAN_COLLECTION);
}

/**
 * Utility function to retrieve the email of the user.
 * @param {Object} req request
 * @returns 
 */
function getEmail(req) {
    // No user detected
    if (!req.user.email) {
        return null;
    }

    // Local login
    return req.user.email;
}

async function getUser(req) {
    const userEmail = getEmail(req);
    if (!userEmail) return null;

    const db = req.client.db(CLIENT);
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) return null;

    if (!user.connections) {
    await usersCollection.updateOne({ email: userEmail }, { $set: { connections: [] } });
    }
    return user;
}

// Create a new transfer plan
router.post('/create', authenticateToken, async (req, res) => {
    try {
    const user = await getUser(req);
    if (!user) return res.status(404).json({ error: "User not found" });

    const transferPlans = await getTransferPlanDBCollection(req);
    const { createPlannerForm } = req.body;

    const existingTransferPlan = await transferPlans.findOne({
        user: user.email,
        'transferPlan.name': createPlannerForm.planName
    });

    if (existingTransferPlan) {
        return res.status(400).json({ error: 'Transfer Plan already exists. Choose a different name.' });
    }

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
        }
        ]
    };

    await transferPlans.insertOne(newTransferPlan);

    return res.status(201).json({
        message: 'New Transfer Plan created successfully',
        transferPlan: newTransferPlan.transferPlan,
    });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all transfer plans
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(404).json({ error: "User not found" });

        const transferPlans = await getTransferPlanDBCollection(req);
        const userTransferPlans = await transferPlans.findOne({ user: user.email });

        if (!userTransferPlans || !userTransferPlans.transferPlans || userTransferPlans.transferPlans.length === 0) {
            return res.status(404).json({ message: 'No transfer plans found', transferPlans: [] });
        }

        return res.status(200).json({
            message: 'Successfully retrieved all transfer plans',
            transferPlans: userTransferPlans.transferPlans,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific transfer plan by name
router.get('/plan/:name', authenticateToken, async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(404).json({ error: "User not found" });

        const transferPlans = await getTransferPlanDBCollection(req);
        const { name } = req.params;

        const transferPlanDocument = await transferPlans.findOne({ user: user.email });

        if (!transferPlanDocument || !transferPlanDocument.transferPlans) {
            return res.status(404).json({ error: "Transfer Plan not found" });
        }

        const specificTransferPlan = transferPlanDocument.transferPlans.find(plan => plan.name === name);

        if (!specificTransferPlan) return res.status(404).json({ error: "Transfer Plan not found" });

        return res.status(200).json({
            message: 'Transfer Plan retrieved successfully',
            transferPlan: specificTransferPlan,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a transfer plan
router.put('/plan/:planName', authenticateToken, async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { planName } = req.params;
        const { updatePlannerForm } = req.body;

        const transferPlans = await getTransferPlanDBCollection(req);
        const existingTransferPlan = await transferPlans.findOne({
            user: user.email,
            'transferPlan.name': planName
        });

        if (!existingTransferPlan) return res.status(404).json({ error: 'Transfer Plan not found.' });

        const updatedTransferPlan = {
            'transferPlan.$.updatedAt': new Date(),
            'transferPlan.$.courseLevel': updatePlannerForm.courseLevel,
            'transferPlan.$.course': updatePlannerForm.course,
            'transferPlan.$.studyYear': updatePlannerForm.studyYear,
            'transferPlan.$.studyPeriod': updatePlannerForm.studyPeriod,
            'transferPlan.$.transferUniversity': updatePlannerForm.transferUniversity,
            'transferPlan.$.name': updatePlannerForm.planName || planName,
        };

        await transferPlans.updateOne(
            { user: user.email, 'transferPlan.name': planName },
            { $set: updatedTransferPlan }
        );

        return res.status(200).json({
            message: 'Transfer Plan updated successfully',
            transferPlan: updatedTransferPlan,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a transfer plan
router.delete('/plan/:planName', authenticateToken, async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { planName } = req.params;

        const transferPlans = await getTransferPlanDBCollection(req);
        const result = await transferPlans.updateOne(
            { user: user.email },
            { $pull: { transferPlan: { name: planName } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Transfer Plan not found or already deleted.' });
        }

        return res.status(200).json({
            message: `Transfer Plan "${planName}" deleted successfully.`,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
