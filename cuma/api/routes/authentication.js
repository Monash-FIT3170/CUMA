import express from 'express';
import mongoErrorCode from '../mongoErrorCode.js';
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

dotenv.config();

const router = express.Router();
const collectionName = 'users'
const port = process.env.PORT || 3000;
const host = 'localhost:' + port

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
            mfaEnabled: false,
            mfaSecret: null,
            createAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date()
        };
        const result = await users.insertOne(newUser);

        // Store user email in session
        req.session.pendingSignupUser = { email: email };

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

        const { email, password } = req.body;
        
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

        // If MFA is enabled, verify the token
        if (existingUser.mfaEnabled) {
            // MFA is enabled, return a special status to indicate that TOTP is needed
            req.session.pendingLoginUser = { email: email }; // Store user info in session for TOTP verification
            console.log(req.session)
            return res.status(206).json({ message: 'MFA required' });
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

router.get('/setup-mfa', async (req, res) => {

    // Fetch email from session
    const userEmail = req.session.pendingSignupUser.email;

    // Fetch the user from the database
    const client = req.client;
    const database = client.db("CUMA");
    const users = database.collection('users');
    const user = await users.findOne({ email: userEmail });

    if (!user) {
        return res.status(404).json({ error: 'User not found, please log in again' });
    }

    // Generate and store the secret in the user's profile (securely)
    const secret = authenticator.generateSecret();
    const updateResult = await users.updateOne({ email: userEmail }, { $set: { mfaSecret: secret } });

    const otpauth = authenticator.keyuri(userEmail, 'Cuma', secret);

    // Generate QR Code and send response
    QRCode.toDataURL(otpauth, (e, imageUrl) => {
        if (e) {
            res.status(500).json({ error: e});
        }

        // Send successful response
        res.status(201).json({ 
            email: userEmail,
            secret,
            imageUrl,
            message: "Successfully Setup MFA"
        });
    });
});

router.post('/enable-mfa', async (req, res) => {
    const { token } = req.body;
    const userEmail = req.session.pendingSignupUser.email;

    const client = req.client;
    const database = client.db("CUMA");
    const users = database.collection('users');

    const existingUser = await users.findOne({ email: userEmail });
    if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    const isValid = authenticator.verify({ token, secret: existingUser.mfaSecret });

    if (isValid) {
        await users.updateOne({ email: userEmail }, { $set: { mfaEnabled: true } });
        res.json({ success: true, message: 'MFA enabled' });
    } else {
        res.status(400).json({ error: 'Invalid MFA token' });
    }
});

router.post('/verify-mfa', async (req, res) => {
    const { token } = req.body;
    console.log(req.session)
    const userEmail = req.session.pendingLoginUser.email;

    const client = req.client;
    const database = client.db("CUMA");
    const users = database.collection('users');

    const existingUser = await users.findOne({ email: userEmail });
    if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    const isValid = authenticator.verify({ token, secret: existingUser.mfaSecret });

    if (isValid) {
        // Create query and update user profile database
        const filter = { email: existingUser.email };
        const update = {
            $set: {
                lastLogin: new Date()
            }
        };
        const result = await users.updateOne(filter, update);

        // update the session details
        req.session.user = {email: userEmail};

        // Send successful response
        res.status(201).json({ 
            message: 'Login successfully',
            data: { email: userEmail},
            result: result
        });
    } else {
        res.status(400).json({ error: 'Invalid MFA token' });
    }
});

router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;

    try {
        const client = req.client;
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a secure token and set an expiration time
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = Date.now() + 3600000; // Token valid for 1 hour

        // Store the token and expiration in the user's record under passwordReset
        await users.updateOne(
            { email }, 
            { $set: { 
                'passwordReset.resetToken': token, 
                'passwordReset.resetTokenExpiry': expiration 
              }
            }
        );

        // Create a user reset link
        const resetLink = `http://${host}/reset-password?token=${token}&email=${email}`;
        
        // Setup Email service
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Compile the password reset email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset your CUMA account password',
            text: `Hi, ${user.firstName},\n\nWe got your request to reset your CUMA account password.\nClick the link to reset your password: ${resetLink}.\nYour password reset link is valid for 1 hours.`
        };

        // Send the password reset email to user
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ error: 'Error sending email' });
            }

            // store the email in the session
            req.session.resetPasswordEmail = { email }

            res.status(200).json({ 
                valid: true,
                info, 
                message: 'Password reset link has been sent to your email.' 
            });
        });

    } catch (error) {
        console.error('Error handling password reset request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, email } = req.body;

    if (!token || !email) {
        return res.status(400).json({ error: 'Missing token or email value.' });
    }

    try {
        const client = req.client;
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        // Find the user based on the email and token
        const user = await users.findOne({
            email,
            'passwordReset.resetToken': token
        });

        // Check if the user exists and the token is still valid
        if (!user || user.passwordReset.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired password reset token. Please request another password reset.' });
        }

        // Send successful response
        res.status(200).json({ message: 'Successfully validated password reset token.' });

    } catch (error) {
        console.error('Error validating reset password token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/update-new-password', async (req, res) => {
    const { email, password, token } = req.body;

    if (!email || !password || !token) {
        return res.status(400).json({ error: 'Email, password, and token are required.' });
    }

    try {
        const client = req.client;
        const database = client.db("CUMA");
        const users = database.collection(collectionName);

        // Verify the token and check if it is associated with the user
        const user = await users.findOne({ 
            email,
            'passwordReset.resetToken': token 
        });

        if (!user || user.passwordReset.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        // Encrypt the new password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Update the user's password in the database and remove the reset token
        await users.updateOne(
            { email },
            { 
                $set: { hashedPassword },
                $unset: { 'passwordReset.resetToken': "", 'passwordReset.resetTokenExpiry': "" }
            }
        );

        // Send successful response
        res.status(200).json({ message: 'Successfully updated new password.' });

    } catch (error) {
        console.error('Error updating new password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;


