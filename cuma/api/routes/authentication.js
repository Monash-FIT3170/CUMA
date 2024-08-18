import express from 'express';
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();
const serverPath = "http://localhost:" + (process.env.PORT || 3000)
const isProduction = process.env.NODE_ENV === 'production';

// Cookies Expiry
const ACCESS_TOKEN_AGE = 5 * 1000;
const REFRESH_TOKEN_AGE = 60 * 1000;

// Users Database value
const DB_NAME = 'CUMA'
const DB_COLLECTION_NAME = 'users'


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

// Signup proccess routers
router.post('/signup', async (req, res) => {

    const { firstName, lastName, email, password } = req.body;

    try {
        
        const {users, existingUser} = await fetchExistingUserfromDB(req, email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = encryptPassword(password);

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
        await users.insertOne(newUser);

        req.session.pendingSignupUser = { email, expiresIn: Date.now() + 5 * 60 * 1000};

        return res.status(201).json({ message: 'Signup successfully' });

    } catch (error) {
        console.error('Error signing up: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/setup-mfa', async (req, res) => {
    
    try{

        const sessionUser = req.session.pendingSignupUser;
        if (!sessionUser || sessionUser.expiresIn <= Date.now()) {
            delete req.session.pendingSignupUser;
            return res.status(400).json({ error: 'Session expired or invalid. Please start the signup process again.' });
        }
        const email = sessionUser.email;

        const {users, existingUser} = await fetchExistingUserfromDB(req, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User not found, please log in again' });
        }

        const secret = authenticator.generateSecret();
        await users.updateOne({ email }, { $set: { mfaSecret: secret } });

        const otpauth = authenticator.keyuri(email, 'Cuma', secret);
        QRCode.toDataURL(otpauth, (e, imageUrl) => {
            if (e) {
                return res.status(500).json({ error: 'Error generating QR code - ' + e });
            }

            req.session.pendingSignupUser.expiresIn = Date.now() + 5 * 60 * 1000; // 5mins

            return res.status(201).json({ 
                email,
                secret,
                imageUrl,
                message: "Successfully setup MFA"
            });
        });

    } catch (error) {
        console.error('Error setting up mfa: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/enable-mfa', async (req, res) => {

    const { token } = req.body;

    try {

        const sessionUser = req.session.pendingSignupUser;
        if (!sessionUser || sessionUser.expiresIn <= Date.now()) {
            delete req.session.pendingSignupUser;  // Delete the session if it has expired
            return res.status(400).json({ error: 'Session expired or invalid. Please start the signup process again.' });
        }
        const email = sessionUser.email;

        const {users, existingUser} = await fetchExistingUserfromDB(req, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User not found, please try again' });
        }

        const isValidMFAToken = authenticator.verify({ token, secret: existingUser.mfaSecret });
        if (!isValidMFAToken) return res.status(400).json({ error: 'Invalid MFA token' });

        await users.updateOne({ email }, { $set: { mfaEnabled: true } });

        delete req.session.pendingSignupUser;

        return res.status(200).json({ message: 'MFA enabled successfully' });

    } catch (error) {
        console.error('Error enabling mfa: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Default login process routers
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

        const {users, existingUser} = await fetchExistingUserfromDB(req, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exists' });
        }

        const isMatchPassword = bcrypt.compareSync(password, existingUser.hashedPassword);
        if (!isMatchPassword) {
            return res.status(400).json({ error: 'Invalid password'});
        }

        if (existingUser.mfaEnabled) {
            req.session.pendingLoginUser = { email, expiresIn: Date.now() + 5 * 60 * 1000 };
            return res.status(206).json({ message: 'MFA required' });
        }

        await processLoginAccessToken(res, users, existingUser)

        return res.status(201).json({ message: 'Login successfully' });

    } catch (error) {
        console.error('Error loging in: ', error);
        return res.status(500).json({ error: error.message});
    }

});

router.post('/verify-mfa', async (req, res) => {

    const { token } = req.body;
    
    try {
        const sessionUser = req.session.pendingLoginUser;
        if (!sessionUser || sessionUser.expiresIn <= Date.now()) {
            delete req.session.pendingLoginUser;  // Delete the session if it has expired
            return res.status(400).json({ error: 'Session expired or invalid. Please log in again.' });
        }
        const userEmail = sessionUser.email;

        const {users, existingUser} = await fetchExistingUserfromDB(req, userEmail);
        if (!existingUser) return res.status(400).json({ error: 'User does not exists' });

        const isValidMFAToken = authenticator.verify({ token: token, secret: existingUser.mfaSecret });
        if (!isValidMFAToken) return res.status(400).json({ error: 'Invalid MFA token' });

        await processLoginAccessToken(res, users, existingUser)

        return res.status(201).json({ message: 'Login successfully' });

    } catch (error) {
        console.error('Error Verifying MFA: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Google authentication routers
router.get('/google', (req, res) => {
    try {

        const state = crypto.randomBytes(32).toString('hex');
        req.session.googleState = { state, expiresIn: Date.now() + 5 * 60 * 1000  };

        const authorizationUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state: state
        });
    
        res.redirect(authorizationUrl);

    } catch (error) {
        console.error('Error Verifying MFA: ', error);
        res.status(500).json({ error: error.message});
    }
});

router.get('/oauth2callback', async (req, res) => {

    const { code, state } = req.query;

    try {

        const sessionGoogle = req.session.googleState;
        if (!sessionGoogle || sessionGoogle.expiresIn <= Date.now()) {
            delete req.session.googleState;  // Delete the session if it has expired
            res.status(400).send('State mismatch. Possible CSRF attack');
            return res.redirect('/login');
        }

        if (state !== sessionGoogle.state) {
            res.status(400).send('State mismatch. Possible CSRF attack');
            return;
        }

        // Retrieve the token from google auth
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Exchange the token for user info data
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const userData = userInfo.data
        const userGoogleID = userData.id;

        const { users, existingUser } = await fetchExistingGoogleUserfromDB(req, userGoogleID);
        await processGoogleLoginAccessToken(res, users, existingUser, userData);

        delete req.session.googleState;
        return res.redirect('/index');

    } catch (error) {
        console.error('Error retrieving access token or user info', error);
        return res.status(500).send('Error retrieving access token or user info');
    }
});

// Logout router
router.get('/logout', async (req, res) => {
    try {
        // Invalidate the refresh token in the database (optional)
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const email = decoded.email;

            const { users, existingUser } = await fetchExistingUserfromDB(req, email);
            if (!existingUser) {
                return res.status(400).json({ error: 'User does not exist' });
            }

            await users.updateOne(
                { email },
                { $unset: { refreshToken: "" } }
            );
        }

        // Clear JWT cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        });

        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Failed to destroy session during logout:', err);
                return res.status(500).json({ error: 'Failed to log out.' });
            }

            // Send a JSON response confirming the logout after the session is destroyed
            return res.status(200).json({ message: 'Logged out successfully' });
        });

    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Request new password routers
router.post('/request-password-reset', async (req, res) => {

    const { email } = req.body;

    try {
        
        const {users, existingUser} = await fetchExistingUserfromDB(req, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exists' });
        }

        if(!proccessResetPasswordResetLink(users, existingUser)) return res.status(500).json({ error: 'Error sending email' });

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });

    } catch (error) {
        console.error('Error handling password reset request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/validate-password-reset-link', async (req, res) => {
    
    const { token, email } = req.body;

    try {

        const { existingUser } = await fetchExistingWithUserPWRestTokenfromDB(req, email, token);
        if (!existingUser || existingUser.passwordReset.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired password reset token. Please request another password reset.' });
        }

        return res.status(200).json({ message: 'Successfully validated password reset token.' });

    } catch (error) {
        console.error('Error validating reset password token:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/update-new-password', async (req, res) => {

    const { email, password, token } = req.body;

    try {
        const { users, existingUser } = await fetchExistingWithUserPWRestTokenfromDB(req, email, token);
        if (!existingUser || existingUser.passwordReset.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired password reset token. Please request another password reset.' });
        }

        const hashedPassword = encryptPassword(password);

        // Update the user's password in the database and remove the reset token
        await users.updateOne(
            { email },
            { 
                $set: { hashedPassword },
                $unset: { 'passwordReset.resetToken': "", 'passwordReset.resetTokenExpiry': "" }
            }
        );

        return res.status(200).json({ message: 'Successfully updated new password.' });

    } catch (error) {
        console.error('Error updating new password:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Access Token Refresh router
router.post('/refresh-token', async (req, res) => {

    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token is missing' });

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(403).json({ message: 'Invalid refresh token' });

            // Fetch the existing user and their refresh token from the database
            const { existingUser } = await fetchExistingWithUserRefreshTokenfromDB(req, user.email, refreshToken);

            if (!existingUser || existingUser.refreshToken.expiresIn < Date.now()) {
                return res.status(400).json({ error: 'Invalid or expired refresh token. Please log in again.' });
            }

            // Generate a new access token
            const newAccessToken = generateAccessToken(existingUser.email, existingUser.role);

            return res.status(200).json({ accessToken: newAccessToken, message: 'Access token refreshed successfully' });
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Refresh token has expired. Please log in again.' });
        } else {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }
});

/// Utility Functions ///

// Generate AccessToken for authentication
function generateAccessToken(email, role) {
    return jwt.sign({ email, role }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
} 

// Generate refresh token for reauthentication
function generateRefreshToken(email, role) {
    return jwt.sign({ email, role }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

// Encrypt password
function encryptPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword
}

// create and add cookies
function createAccessTokenCookie(res, cookieToken) {
     // Set cookies
    res.cookie('accessToken', cookieToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: ACCESS_TOKEN_AGE
    });
}

function createRefreshTokenCookie(res, cookieToken) {
     // Set cookies
    res.cookie('refreshToken', cookieToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: REFRESH_TOKEN_AGE
    });
}

// Fetch existing user from users collection
async function fetchExistingUserfromDB(req, email) {
    // Get the client, database, and collection
    const client = req.client;
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    
    // Check if user exists
    const existingUser = await users.findOne({ email });
    return { users, existingUser };
}

// Fetch existing google user from users collection
async function fetchExistingGoogleUserfromDB(req, userGoogleID) {
    // Get the client, database, and collection
    const client = req.client;
    const database = client.db("CUMA");
    const users = database.collection(DB_COLLECTION_NAME);
    
    // Check if user exists
    const existingUser = await users.findOne({ userGoogleID });
    return { users, existingUser };
}

// Fetch exiting user with matching password reset token
async function fetchExistingWithUserPWRestTokenfromDB(req, email, token) {
    // Get the client, database, and collection
    const client = req.client;
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    
    // Check if user exists
    const existingUser = await users.findOne({ 
        email,
        'passwordReset.resetToken': token 
    });
    return { users, existingUser };
}

// Fetch exiting user with matching refresh token
async function fetchExistingWithUserRefreshTokenfromDB(req, email, refreshToken) {
    // Get the client, database, and collection
    const client = req.client;
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    
    // Check if user exists
    const existingUser = await users.findOne({ 
        email,
        'refreshToken.token': refreshToken 
    });
    return { users, existingUser };
}

// Process Login access token
async function processLoginAccessToken(res, users, existingUser){
    // Generate token details
    const accessToken = generateAccessToken(existingUser.email, existingUser.role)
    const refreshToken = generateRefreshToken(existingUser.email, existingUser.role)
    
    // update database
    const filter = { email: existingUser.email };
    const update = {
        $set: {
            lastLogin: new Date(),
            refreshToken: { token: refreshToken, expiresIn: Date.now() + REFRESH_TOKEN_AGE }
        }
    };
    await users.updateOne(filter, update);

    // Set cookies
    createAccessTokenCookie(res, accessToken);
    createRefreshTokenCookie(res, refreshToken);
}

// Process Google Login access token
async function processGoogleLoginAccessToken(res, users, existingUser, userData){
    // Generate refresh tokens
    const refreshToken = generateRefreshToken(userData.email, 'general_user');

    // Create or update user in the database
    if (!existingUser) {
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
            refreshToken: { token: refreshToken, expiresIn: Date.now() + REFRESH_TOKEN_AGE }
        };
        await users.insertOne(newUser);
    } else {
        const filter = { userGoogleID: userData.id };
        const update = {
            $set: {
                lastLogin: new Date(),
                refreshToken: { token: refreshToken, expiresIn: Date.now() + REFRESH_TOKEN_AGE }
            }
        };
        await users.updateOne(filter, update);
    }

    // Generate access token
    const accessToken = generateAccessToken(userData.email, userData.role);

    // Set cookies
    createAccessTokenCookie(res, accessToken)
    createRefreshTokenCookie(res, refreshToken)
}

// Process setting password reset link and send it to user
async function proccessResetPasswordResetLink(users, existingUser) {
    // Generate a secure token and set an expiration time
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 1 * 60 * 60 * 1000; // Token valid for 1 hour

    // Store the token and expiration in the user's record under passwordReset
    await users.updateOne(
        { email: existingUser.email }, 
        { $set: { 
            'passwordReset.resetToken': token, 
            'passwordReset.resetTokenExpiry': expiration 
            }
        }
    );

    // Create a user reset link
    const resetLink = `${serverPath}/reset-password?token=${token}&email=${existingUser.email}`;
    
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
        to: existingUser.email,
        subject: 'Reset your CUMA account password',
        text: `Hi ${existingUser.firstName},\n\nWe got your request to reset your CUMA account password.\nClick the link to reset your password: ${resetLink}.\nYour password reset link is valid for 1 hour.`
    };

    // Send the password reset email to user
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.log("Error sending email: ", error);
        return false;
    }
}

export default router;


