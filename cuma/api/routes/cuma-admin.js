import express from 'express';
import dotenv from 'dotenv';
import * as AuthUtils from '../utils/auth-utils.js';

dotenv.config();

const router = express.Router();
const serverPath = "http://localhost:" + (process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';


router.get('/users')
router.post('/users')
router.get('/users/:id')
router.put('/users/:id')
router.delete('/users/:id')

router.get('/pending-verifications')
router.post('/verify-user/:userId')
router.post('/reject-user/:userId')

router.post('/login')
router.post('/logout')
router.get('/me')

router.get('search-users')
router.get('/filter-users')
