import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as AuthUtils from '../utils/auth-utils.js';

dotenv.config();

const router = express.Router();
const serverPath = "http://localhost:" + (process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

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
        const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = AuthUtils.encryptPassword(password);

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
    try {
        const sessionUser = req.session.pendingSignupUser;
        if (!sessionUser || sessionUser.expiresIn <= Date.now()) {
            delete req.session.pendingSignupUser;
            return res.status(400).json({ error: 'Session expired or invalid. Please start the signup process again.' });
        }
        const email = sessionUser.email;

        const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User not found, please log in again' });
        }

        try {
            const { secret, imageUrl } = await AuthUtils.setupMFA(users, email);

            req.session.pendingSignupUser.expiresIn = Date.now() + 5 * 60 * 1000; // 5mins

            return res.status(201).json({ 
                email,
                secret,
                imageUrl,
                message: "Successfully setup MFA"
            });
        } catch (e) {
            return res.status(500).json({ error: 'Error generating QR code - ' + e });
        }

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

        const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User not found, please try again' });
        }

        const isValidMFAToken = AuthUtils.verifyMFA(token, existingUser.mfaSecret);
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
        const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const isMatchPassword = await AuthUtils.comparePassword(password, existingUser.hashedPassword);
        if (!isMatchPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        if (existingUser.mfaEnabled) {
            req.session.pendingLoginUser = { email, expiresIn: Date.now() + 5 * 60 * 1000 };
            return res.status(206).json({ message: 'MFA required' });
        }

        await AuthUtils.processLoginAccessToken(res, users, existingUser, isProduction);

        return res.status(201).json({ message: 'Login successful' });

    } catch (error) {
        console.error('Error logging in: ', error);
        return res.status(500).json({ error: error.message });
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

        const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, userEmail);

        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const isValidMFAToken = AuthUtils.verifyMFA(token, existingUser.mfaSecret);
        if (!isValidMFAToken) {
            return res.status(400).json({ error: 'Invalid MFA token' });
        }

        await AuthUtils.processLoginAccessToken(res, users, existingUser, isProduction);

        return res.status(201).json({ message: 'Login successful' });

    } catch (error) {
        console.error('Error Verifying MFA: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Google authentication routers
router.get('/google', (req, res) => {
    try {

        const state = AuthUtils.generaRandomToken();
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

        // Retrieve the token from Google auth
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Exchange the token for user info data
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const userData = userInfo.data;
        const userGoogleID = userData.id;

        const { users, existingUser } = await AuthUtils.fetchExistingGoogleUserFromDB(req.client, userGoogleID);
        await AuthUtils.processGoogleLoginAccessToken(res, users, existingUser, userData, isProduction);

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

            const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, email);
            if (!existingUser) {
                return res.status(400).json({ error: 'User does not exist' });
            }

            await users.updateOne(
                { email },
                { $unset: { refreshToken: "" } }
            );
        }

        // Clear JWT cookies
        AuthUtils.clearTokenCookies(res, isProduction);

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
        const { users, existingUser } = await AuthUtils.fetchExistingUserFromDB(req.client, email);
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        if (!await AuthUtils.processResetPasswordLink(users, existingUser, serverPath)) {
            return res.status(500).json({ error: 'Error sending email' });
        }

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });

    } catch (error) {
        console.error('Error handling password reset request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/validate-password-reset-link', async (req, res) => {
    const { token, email } = req.body;

    try {
        const { existingUser } = await AuthUtils.fetchExistingUserWithPwResetTokenFromDB(req.client, email, token);
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
        const { users, existingUser } = await AuthUtils.fetchExistingUserWithPwResetTokenFromDB(req.client, email, token);
        if (!existingUser || existingUser.passwordReset.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired password reset token. Please request another password reset.' });
        }

        const hashedPassword = AuthUtils.encryptPassword(password);

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

            const { existingUser } = await AuthUtils.fetchExistingUserWithRefreshTokenFromDB(req.client, user.email, refreshToken);

            if (!existingUser || existingUser.refreshToken.expiresIn < Date.now()) {
                return res.status(400).json({ error: 'Invalid or expired refresh token. Please log in again.' });
            }

            const newAccessToken = AuthUtils.generateAccessToken(existingUser.email, existingUser.role);

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

export default router;


