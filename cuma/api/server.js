import express from 'express';
import { MongoClient } from 'mongodb';
import unit from './routes/unit.js';
import unitConnection from './routes/unitConnection.js';
import dotenv from 'dotenv';
import cors from 'cors';

import path from 'path'
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3000;
const client = new MongoClient(process.env.MONGODB_URI);
// Testing for deployment

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Testing for deployment
app.use(express.static(path.join(__dirname, '..', 'front-end')));

app.use('/backend', express.static(path.join(__dirname, '..', 'backend')));


// body parser
app.use(express.json());

app.use(cors({
    origin: 'http://3.25.70.20', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

// Middleware to attach MongoDB client to requests
app.use((req, res, next) => {
    req.client = client;
    next();
});

// Mount the route handlers
app.use('/api/unit', unit);
app.use('/api/unitConnection/', unitConnection);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'front-end', 'index.html'));
});

async function run() {
    try {
        // connect to DB
        await client.connect();
        console.log("Connected to MongoDB");
        // Start the Express server
        const server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
        //function to close server
        const closeServer = async () => {
            //closing server
            await server.close(() => {
                console.log("HTTP server closed.");
            });
            //closing database
            await client.close();
            console.log("MongoDB connection closed.");
        };
        // signal to close ctr + c
        process.on('SIGINT', async () => {
            console.log("Shutting down server");
            await closeServer();
            process.exit(0);
        });

    } catch(error) {
        // catch any error
        console.error("Failed to start the application", error);
        await client.close();
        process.exit(1);
    }
}

run().catch(async (error) => {
    console.error("An error occurred while running the server", error);
    await client.close();
    process.exit(1);
});