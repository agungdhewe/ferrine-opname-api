import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateSignature } from '../middleware/signatureMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoints Public (dengan Signature Validation)
router.post('/login', validateSignature, authController.login);
router.post('/refresh', validateSignature, authController.refresh);

// Endpoints Protected (dengan Signature & JWT Validation)
router.post('/logout', validateSignature, authenticateToken, authController.logout);

export default router;
