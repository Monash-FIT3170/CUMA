import { google } from 'googleapis';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

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
    'https://www.googleapis.com/auth/userinfo.email', // Access email
    'https://www.googleapis.com/auth/userinfo.profile', // Access user profile
    'openid' // access Users openid
];

// Generate an authorization URL
const generateAuthUrl = (req) => {
  const state = crypto.randomBytes(32).toString('hex');
  req.session.state = state;

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    state: state
  });
};

// Retrieve user profile information
const getUserInfo = async (code, sessionState) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  return userInfo.data;
};

export { generateAuthUrl, getUserInfo };