import express from 'express';
import { MongoClient } from 'mongodb';
import unit from './routes/unit.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// Middleware to attach MongoDB client to requests
app.use((req, res, next) => {
    req.client = new MongoClient(process.env.MONGODB_URI);
    next();
});

// Mount the route handlers
app.use('/api/unit', unit);

async function run() {
    try {
        // Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } finally {
        // Ensure that the client will close when the application exits
        // await app.locals.client.close();
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!');
});

run().catch(console.dir);
