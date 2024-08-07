import express from 'express';
import { MongoClient } from 'mongodb';
import unit from './routes/unit.js';
import unitConnection from './routes/unitConnection.js';
import authentication from './routes/authentication.js';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import { generateAuthUrl, getUserInfo } from './googleAuth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();
const port = 3000;
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

// OAuth 2.0 route to initiate the authentication process
app.get('/auth/google', (req, res) => {
  const authorizationUrl = generateAuthUrl(req);
  res.redirect(authorizationUrl);
});

// OAuth 2.0 callback route
app.get('/oauth2callback', async (req, res) => {
  const { code, state } = req.query;

  if (state !== req.session.state) {
    console.log('State mismatch. Possible CSRF attack');
    res.status(400).send('State mismatch. Possible CSRF attack');
    return;
  }

  try {
    const userInfo = await getUserInfo(code);
    req.session.user = userInfo;

    // TODO: Add validation/connection to database for proper autorisation
    console.log('User Info:', userInfo);
    res.redirect('/index.html'); // Redirect to home page after authentication

  } catch (error) {
    console.error('Error retrieving access token or user info', error);
    res.status(500).send('Error retrieving access token or user info');
  }
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
  // if (req.session.user) {
  //   res.send(`Hello, ${req.session.user.name}! Your email is ${req.session.user.email}. <a href="/logout">logout</a>`);
  // } else {
  //   res.send('Hello World! Please <a href="/auth/google">login</a>.');
  // }
});

// logout route
app.get('/logout', (req, res) => {
  // Revoke the OAuth token if needed
  if (req.session.user && req.session.user.access_token) {
    revokeToken(req.session.user.access_token);
  }

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Failed to destroy session during logout:', err);
      return res.status(500).send('Failed to log out.');
    }

    // Redirect to home or login page
    res.redirect('/');
  });
});

// Connect to MongoDB and start the server
async function run() {
  try {
    // Connect to DB
    await client.connect();
    console.log("Connected to MongoDB");
    // Start the Express server
    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
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