import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { validateSignature } from './middleware/signatureMiddleware.js';
import { authenticateToken } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Dasar
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Demo Protected Route (Signature only)
app.post('/api/v1/test/signature', validateSignature, (req, res) => {
    res.json({
        status: 'success',
        message: 'Signature validation passed!',
        receivedBody: req.body
    });
});

// Demo Protected Route (Signature + JWT)
app.post('/api/v1/test/secure', validateSignature, authenticateToken, (req, res) => {
    res.json({
        status: 'success',
        message: 'Signature and JWT validation passed!',
        user: req.user
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
