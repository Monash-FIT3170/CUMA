import express from 'express';
import { MongoClient } from 'mongodb';
import unit from './routes/unit.js';
import unitConnection from './routes/unitConnection.js';
import authentication from './routes/authentication.js';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
// import { generateAuthUrl, getUserInfo } from './googleAuth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGODB_URI);

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'your_secure_secret_key', // Replace with a strong secret during production and reference from .env
  resave: false,
  saveUninitialized: false,
}));
app.use(express.static(path.join(__dirname, '..', 'front-end'), { index: false })); // Using all the static files within front-end

// Middleware to attach MongoDB client to requests
app.use((req, res, next) => {
  req.client = client;
  next();
});

// Mount the route handlers
app.use('/api/unit', unit);
app.use('/api/unitConnection/', unitConnection);
app.use('/api/authentication/', authentication);

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'index.html'));
});

// Example route that uses the authenticated user's info
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'login.html'));
});

// // logout route
// app.get('/logout', (req, res) => {
//   // Revoke the OAuth token if needed
//   if (req.session.user && req.session.user.access_token) {
//     revokeToken(req.session.user.access_token);
//   }

//   // Destroy the session
//   req.session.destroy((err) => {
//     if (err) {
//       console.error('Failed to destroy session during logout:', err);
//       return res.status(500).send('Failed to log out.');
//     }

//     // Redirect to home or login page
//     res.redirect('/');
//   });
// });

// Connect to MongoDB and start the server
async function run() {
  try {
    // Connect to DB
    await client.connect();
    console.log("Connected to MongoDB");
    // Start the Express server
    const server = app.listen(port, () => {
      console.log(`Server is running in ${process.env.NODE_ENV} mode on http://localhost:${port}`);
    });
    // Function to close server
    const closeServer = async () => {
      // Closing server
      await server.close(() => {
        console.log("HTTP server closed.");
      });
      // Closing database
      await client.close();
      console.log("MongoDB connection closed.");
    };
    // Signal to close ctrl + c
    process.on('SIGINT', async () => {
      console.log("Shutting down server");
      await closeServer();
      process.exit(0);
    });
  } catch (error) {
    // Catch any error
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