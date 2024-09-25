import express from 'express';
import dotenv from 'dotenv';
import * as AuthUtils from '../utils/auth-utils.js';
import User from '../models/UserSchema.js';

dotenv.config();

const router = express.Router();
const serverPath = "http://localhost:" + (process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';


router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-hashedPassword -userGoogleId -additional_info._id').lean();
        return res.status(200).json({message: 'Successfully retreived user data', data: users});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }

});
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-hashedPassword -userGoogleId');
        if (user) {
            return res.status(200).json({message: 'Successfully retreived user data', data: user});
        } 
        return res.status(404).json({message: 'User not found'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

router.put('/users/update-role/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-hashedPassword -userGoogleId');
        if (user) {
            user.roles = req.body.roles;
            await user.save();
            return res.status(200).json({message: 'User role updated successfully', data: user});
        }
        return res.status(404).json({message: 'User not found'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-hashedPassword -userGoogleId');
        if (user) {
            await user.delete();
            return res.status(200).json({message: 'User deleted successfully'});
        }
        return res.status(404).json({message: 'User not found'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

router.get('/pending-verifications', async (req, res) => {
    try {
        const users = await User.find({status: 'pending_verification'}).select('-hashedPassword -userGoogleId');
        return res.status(200).json({message: 'Successfully retreived user data', data: users});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}); 
router.post('/verify-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (user) {
            user.status = 'active';
            user.verifiedAt = new Date();
            user.updateOne({status: 'active', verifiedAt: new Date()}, {$unset: {askingRole: ""}});
            await user.save();
            return res.status(200).json({message: 'User verified successfully'});
        }
        return res.status(404).json({message: 'User not found'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});
router.post('/reject-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (user) {
            user.status = 'rejected';
            await user.save();
            return res.status(200).json({message: 'User rejected successfully'});
        }
        return res.status(404).json({message: 'User not found'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/login')
router.post('/logout')
router.get('/me')

router.get('/search-users', async (req, res) => {
    try {
        const {search} = req.query;
        if (!search || search.trim() === '') {
            return res.status(400).json({message: 'Search query is required'});
        }
        const users = await User.find({
            $or: [
                {email: {$regex: search, $options: 'i'}},
                {firstName: {$regex: search, $options: 'i'}},
                {lastName: {$regex: search, $options: 'i'}}
            ]
        }).select('-hashedPassword');

        if (users.length === 0) {
            return res.status(404).json({message: 'No users found'});
        }

        return res.status(200).json({message: 'Successfully retreived user data', data: users});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});
router.get('/filter-users')


export default router;