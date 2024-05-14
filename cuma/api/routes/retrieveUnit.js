import express from 'express';
const router = express.Router();

router.get('/retrieveUnit',async (req,res) => {
    try {
        const client = req.client;
        const {university, unitCode} = res.query;

        if (!university || !unitCode){
            return res.status(400).json({ error: "Both university and unitCode must be provided" });
        }

        const db = client.db('CUMA');
        const collection = db.collection('units');

        const unit = await collection.findOne({universityName: university,unitCode: unitCode});

        if (unit){
            res.json(unit);
        }else{
            res.status(404).json({error: "Unit not found"});
        }
    }catch{
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;