import express from 'express';
import mongoErrorCode from '../mongoErrorCode.js';
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const collectionName = 'users'

// OAuth2 Client Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Create an OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Access scopes for user profile and email
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
];

router.post('/signup', async (req, res) => {

    try {
        // get the client
        const client = req.client;
        // get the database and the collection
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        const { email, password} = req.body;
        const existingUser = await users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = {
            email,
            hashedPassword,
            emailVerified: false,
            role: 'general_user',
            createAt: new Date(),
            updatedAt: new Date(),
        };

        await users.insertOne(newUser);
        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Error signing up: ', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.post('/login', async (req, res) => {

    try {

        // get the client
        const client = req.client;
        // get the database and the collection
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        const { email, password} = req.body;
        const existingUser = await users.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = bcrypt.compareSync(password, existingUser.hashedPassword);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials'});
        }

        res.json({ message: 'Login successful' });

    } catch (error) {
        res.status(500).json({ message: 'Error loggin in', error: error.message});
    }

});

router.get('/google', (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');
    req.session.state = state;
  
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: state
    });
  
    res.redirect(authorizationUrl);
  });
  

router.get('/oauth2callback', async (req, res) => {
const { code, state } = req.query;

    if (state !== req.session.state) {
        console.log('State mismatch. Possible CSRF attack');
        res.status(400).send('State mismatch. Possible CSRF attack');
        return;
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const userData = userInfo.data

        // get the client
        const client = req.client;
        // get the database and the collection
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        // Extract the User Google ID and validate against database
        const userGoogleID = userData.id
        const existingUser = await users.findOne({ userGoogleID });

        // Create a new user if the user does not exit in the database
        if (!existingUser) {
            console.log("New User...Creating new user in database")
            
            // Create a new user in database
        } else {
            console.log("Exisiting User...Updating Database")
            // Update Metadata
            
        }

        console.log('User Info:', userData);
        res.redirect('/index')

    } catch (error) {

        console.error('Error retrieving access token or user info', error);
        res.status(500).send('Error retrieving access token or user info');
    }
});

export default router;


