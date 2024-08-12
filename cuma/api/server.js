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
app.use('/backend', express.static(path.join(__dirname, '../backend')));  // Serve backend JavaScript files

// Middleware to attach MongoDB client to requests
app.use((req, res, next) => {
  req.client = client;
  next();
});

// Mount the route handlers
app.use('/api/unit', unit);
app.use('/api/unitConnection/', unitConnection);
app.use('/api/authentication/', authentication);

// Page Link
app.get('/index', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, '..', 'front-end', 'index.html'));
  } else {
    res.redirect('/login')
  }
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/index')
  } else {
    res.redirect('/login')
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'signup.html'));
});

app.get('/signup/mfa-init', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'mfa-init.html'));
});

app.get('/signup/mfa-setup-qr', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'mfa-setup-qr.html'));
});

app.get('/signup/mfa-verify-totp', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'mfa-verify-totp.html'));
});

app.get('/login/verify-totp', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'login-verify-totp.html'));
});

app.get('/login/request-password-reset', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'request-pw-reset.html'));
});

app.get('/login/request-password-reset-success', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'request-pw-reset-success.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'create-new-pw.html'));
});

app.get('/reset-password-success', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'create-new-pw-success.html'));
});

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