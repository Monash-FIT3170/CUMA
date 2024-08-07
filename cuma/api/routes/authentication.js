import express from 'express';
import mongoErrorCode from '../mongoErrorCode.js';
import bcrypt from 'bcryptjs'

const router = express.Router();
const collectionName = 'users'
router.post('/signup', async (req, res) => {

    try {
        // get the client
        const client = req.client;
        //get the database and the collection
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
        //get the database and the collection
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

export default router;