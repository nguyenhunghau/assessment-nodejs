import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload, User, UserRole } from '../types';
import { userQueries } from '../queries/userQueries';
import { logger } from '../util/logger';

const getJwtSecret = (): string => {
    return process.env.JWT_SECRET || 'dev-secret-change-me';
};

const getJwtExpiresIn = (): string => {
    return process.env.JWT_EXPIRES_IN || '1h';
};

export async function register(input: { email: string; password: string; role?: UserRole }): Promise<{ user: Pick<User, 'id' | 'email' | 'role'>; token: string }> {
    logger.debug('Register attempt', { email: input.email });
    
    const email = input.email?.trim().toLowerCase();
    if (!email) {
        logger.warn('Registration failed: Email is required');
        throw new Error('Email is required');
    }

    if (!input.password || input.password.length < 8) {
        logger.warn('Registration failed: Password too short', { email });
        throw new Error('Password must be at least 8 characters');
    }

    const exists = await userQueries.userExistsByEmail(email);
    if (exists) {
        logger.warn('Registration failed: Email already registered', { email });
        throw new Error('Email already registered');
    }

    const role: UserRole = input.role || 'employee';
    const password_hash = await bcrypt.hash(input.password, 10);

    const created = await userQueries.createUser({ email, password_hash, role });

    const token = signToken({
        userId: created.id as number,
        email: created.email,
        role: created.role
    });

    logger.info('User registered successfully', { userId: created.id, email, role });

    return {
        user: { id: created.id, email: created.email, role: created.role },
        token
    };
}

export async function login(input: { email: string; password: string }): Promise<{ user: Pick<User, 'id' | 'email' | 'role'>; token: string }> {
    logger.debug('Login attempt', { email: input.email });
    
    const email = input.email?.trim().toLowerCase();
    if (!email) {
        logger.warn('Login failed: Email is required');
        throw new Error('Email is required');
    }

    if (!input.password) {
        logger.warn('Login failed: Password is required', { email });
        throw new Error('Password is required');
    }

    const userWithPassword = await userQueries.getUserByEmailWithPassword(email);
    if (!userWithPassword?.password_hash) {
        logger.warn('Login failed: User not found', { email });
        throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, userWithPassword.password_hash);
    if (!valid) {
        logger.warn('Login failed: Invalid password', { email });
        throw new Error('Invalid email or password');
    }

    const token = signToken({
        userId: userWithPassword.id as number,
        email: userWithPassword.email,
        role: userWithPassword.role
    });

    logger.info('User logged in successfully', { userId: userWithPassword.id, email, role: userWithPassword.role });

    return {
        user: { id: userWithPassword.id, email: userWithPassword.email, role: userWithPassword.role },
        token
    };
}

export function signToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload as any, getJwtSecret(), { expiresIn: getJwtExpiresIn() } as any);
}
