import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';
import { logger } from '../util/logger';

// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                role: 'admin' | 'employee';
            };
        }
    }
}

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // Keep a safe default for local dev/tests, but strongly recommend setting env var.
        return 'dev-secret-change-me';
    }
    return secret;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        logger.warn('Authentication failed: Missing or invalid Authorization header', { 
            path: req.path, 
            method: req.method 
        });
        return res.status(401).json({
            success: false,
            message: 'Missing or invalid Authorization header'
        });
    }

    const token = authHeader.slice('Bearer '.length);

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        logger.debug('Authentication successful', { 
            userId: decoded.userId, 
            email: decoded.email, 
            path: req.path 
        });
        return next();
    } catch {
        logger.warn('Authentication failed: Invalid or expired token', { 
            path: req.path, 
            method: req.method 
        });
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
