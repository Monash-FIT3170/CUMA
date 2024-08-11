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
        // get the client, database and collection
        const client = req.client;
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        const { firstName, lastName, email, password } = req.body;
        
        // Check if user exist
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create query to insert new user in database
        const newUser = {
            hashedPassword,
            email,
            emailVerified: false,
            emailHD: email.split('@')[1],
            firstName,
            lastName,
            role: 'general_user',
            createAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date()
        };
        const result = await users.insertOne(newUser);

        // Send successful response
        res.status(201).json({ 
            message: 'Signup successfully',
            data: { email: email},
            result: result
        });

    } catch (error) {
        console.error('Error signing up: ', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.post('/login', async (req, res) => {

    try {

        // get the client, database and collection
        const client = req.client;
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        const { email, password} = req.body;
        
        // Check if user exist
        const existingUser = await users.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare if password match
        const isMatch = bcrypt.compareSync(password, existingUser.hashedPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password'});
        }

        // Create query and update user profile database
        const filter = { email: existingUser.email };
        const update = {
            $set: {
                lastLogin: new Date()
            }
        };
        const result = await users.updateOne(filter, update);

        // update the session details
        req.session.user = {email: email};

        // Send successful response
        res.status(201).json({ 
            message: 'Login successfully',
            data: { email: email},
            result: result
        });

    } catch (error) {
        console.error('Error loging in: ', error);
        res.status(500).json({ error: error.message});
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
        // Retrieve the token from google auth
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Exchange the token for user info data
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const userData = userInfo.data

        // update the session details
        req.session.user = userInfo;

        // Print user data
        console.log('User Info:', userData);

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
            
            // TODO: Update database structure once finalised
            // Create a new user data
            const newUser = {
                userGoogleID: userData.id,
                email: userData.email,
                emailVerified: userData.verified_email,
                emailHD: userData.hd,
                firstName: userData.given_name,
                lastName: userData.family_name,
                role: 'general_user',
                createAt: new Date(),
                updatedAt: new Date(),
                lastLogin: new Date(),
            };

            // Insert the data in the database
            const result = await users.insertOne(newUser);
            console.log("New User created successfully: ", result)

            // TODO: Redirect to Profile form and ask user to fill in additional information to complete profile.
        } else {
            console.log("Exisiting User...Updating Database")
            // Create query to update user profile database
            const filter = { userGoogleID: userData.id };
            const update = {
                $set: {
                    lastLogin: new Date()
                }
            };

            // update the user profile
            const result = await users.updateOne(filter, update);
            console.log(result)
            console.log("Successfully updated Database")
        }

        // Redirect to index
        res.redirect('/index')

    } catch (error) {

        console.error('Error retrieving access token or user info', error);
        res.status(500).send('Error retrieving access token or user info');
    }
});

router.get('/logout' , async (req, res) => {
    // This code is unusable since revokeToken does not exist
    // TODO: need actual revoking of token and not just destroying
    //
    // if (req.session.user && req.session.user.access_token) {
    //     revokeToken(req.session.user.access_token);
    // }

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session during logout:', err);
            return res.status(500).json({ error: 'Failed to log out.' });
        }
        // Send a JSON response instead of redirecting
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

export default router;


