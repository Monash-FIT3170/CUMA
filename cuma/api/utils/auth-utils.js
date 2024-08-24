// auth-utils.js

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Constants
const ACCESS_TOKEN_AGE = 15 * 60 * 1000;    // 15mins
const REFRESH_TOKEN_AGE = 60 * 60 * 1000;   // 1hr
const DB_NAME = 'CUMA';
const DB_COLLECTION_NAME = 'users';

// Token generation
export function generateAccessToken(email, role) {
    return jwt.sign({ email, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(email, role) {
    return jwt.sign({ email, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// Cookie deletion
export function clearTokenCookies(res, isProduction) {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/'
    });
}

// Random token generation
export function generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Password encryption
export function encryptPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

// Password comparison
export function comparePassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

// Cookie creation
export function createAccessTokenCookie(res, cookieToken, isProduction) {
    res.cookie('accessToken', cookieToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: ACCESS_TOKEN_AGE
    });
}

export function createRefreshTokenCookie(res, cookieToken, isProduction) {
    res.cookie('refreshToken', cookieToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: REFRESH_TOKEN_AGE
    });
}

// Database operations
export async function fetchExistingUserFromDB(client, email) {
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    const existingUser = await users.findOne({ email });
    return { users, existingUser };
}

export async function fetchExistingGoogleUserFromDB(client, userGoogleID) {
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    const existingUser = await users.findOne({ userGoogleID });
    return { users, existingUser };
}

export async function fetchExistingUserWithPwResetTokenFromDB(client, email, token) {
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    const existingUser = await users.findOne({ 
        email,
        'passwordReset.resetToken': token 
    });
    return { users, existingUser };
}

export async function fetchExistingUserWithRefreshTokenFromDB(client, email, refreshToken) {
    const database = client.db(DB_NAME);
    const users = database.collection(DB_COLLECTION_NAME);
    const existingUser = await users.findOne({ 
        email,
        'refreshToken.token': refreshToken 
    });
    return { users, existingUser };
}

// Token processing
export async function processLoginAccessToken(res, users, existingUser, isProduction) {
    const accessToken = generateAccessToken(existingUser.email, existingUser.role);
    const refreshToken = generateRefreshToken(existingUser.email, existingUser.role);
    
    await users.updateOne(
        { email: existingUser.email },
        {
            $set: {
                lastLogin: new Date(),
                refreshToken: { token: refreshToken, expiresIn: Date.now() + REFRESH_TOKEN_AGE }
            }
        }
    );

    createAccessTokenCookie(res, accessToken, isProduction);
    createRefreshTokenCookie(res, refreshToken, isProduction);
}

// Process Google login
export async function processGoogleLoginAccessToken(res, users, existingUser, userData, isProduction) {
    const refreshToken = generateRefreshToken(userData.email, 'general_user');

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
        await users.updateOne(
            { userGoogleID: userData.id },
            {
                $set: {
                    lastLogin: new Date(),
                    refreshToken: { token: refreshToken, expiresIn: Date.now() + REFRESH_TOKEN_AGE }
                }
            }
        );
    }

    const accessToken = generateAccessToken(userData.email, userData.role);

    createAccessTokenCookie(res, accessToken, isProduction);
    createRefreshTokenCookie(res, refreshToken, isProduction);
}

// Password reset
export async function processResetPasswordLink(users, existingUser, serverPath) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 1 * 60 * 60 * 1000; // Token valid for 1 hour

    await users.updateOne(
        { email: existingUser.email }, 
        { $set: { 
            'passwordReset.resetToken': token, 
            'passwordReset.resetTokenExpiry': expiration 
            }
        }
    );

    const resetLink = `${serverPath}/reset-password?token=${token}&email=${existingUser.email}`;
    
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: existingUser.email,
        subject: 'Reset your CUMA account password',
        text: `Hi ${existingUser.firstName},\n\nWe got your request to reset your CUMA account password.\nClick the link to reset your password: ${resetLink}.\nYour password reset link is valid for 1 hour.`
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.log("Error sending email: ", error);
        return false;
    }
}

// MFA
export async function setupMFA(users, email) {
    const secret = authenticator.generateSecret();
    await users.updateOne({ email }, { $set: { mfaSecret: secret } });

    const otpauth = authenticator.keyuri(email, 'Cuma', secret);
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(otpauth, (err, imageUrl) => {
            if (err) {
                reject(err);
            } else {
                resolve({ secret, imageUrl });
            }
        });
    });
}

export function verifyMFA(token, secret) {
    return authenticator.verify({ token, secret });
}