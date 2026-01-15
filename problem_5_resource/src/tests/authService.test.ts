import * as authService from '../service/authService';
import { userQueries } from '../queries/userQueries';
import bcrypt from 'bcryptjs';

jest.mock('../queries/userQueries');
jest.mock('bcryptjs');

const mockUserQueries = userQueries as jest.Mocked<typeof userQueries>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            mockUserQueries.userExistsByEmail.mockResolvedValue(false);
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword' as any);
            mockUserQueries.createUser.mockResolvedValue({
                id: 1,
                email: 'test@company.com',
                role: 'employee',
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await authService.register({
                email: 'test@company.com',
                password: 'Password123'
            });

            expect(result.user.email).toBe('test@company.com');
            expect(result.token).toBeDefined();
            expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123', 10);
        });

        it('should normalize email to lowercase', async () => {
            mockUserQueries.userExistsByEmail.mockResolvedValue(false);
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword' as any);
            mockUserQueries.createUser.mockResolvedValue({
                id: 1,
                email: 'test@company.com',
                role: 'employee',
                created_at: new Date(),
                updated_at: new Date()
            });

            await authService.register({
                email: 'TEST@COMPANY.COM',
                password: 'Password123'
            });

            expect(mockUserQueries.userExistsByEmail).toHaveBeenCalledWith('test@company.com');
        });

        it('should throw error if email is empty', async () => {
            await expect(
                authService.register({ email: '', password: 'Password123' })
            ).rejects.toThrow('Email is required');
        });

        it('should throw error if password is too short', async () => {
            await expect(
                authService.register({ email: 'test@company.com', password: 'short' })
            ).rejects.toThrow('Password must be at least 8 characters');
        });

        it('should throw error if email already exists', async () => {
            mockUserQueries.userExistsByEmail.mockResolvedValue(true);

            await expect(
                authService.register({ email: 'test@company.com', password: 'Password123' })
            ).rejects.toThrow('Email already registered');
        });

        it('should register with admin role when specified', async () => {
            mockUserQueries.userExistsByEmail.mockResolvedValue(false);
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword' as any);
            mockUserQueries.createUser.mockResolvedValue({
                id: 1,
                email: 'admin@company.com',
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await authService.register({
                email: 'admin@company.com',
                password: 'Password123',
                role: 'admin'
            });

            expect(mockUserQueries.createUser).toHaveBeenCalledWith({
                email: 'admin@company.com',
                password_hash: 'hashedPassword',
                role: 'admin'
            });
            expect(result.user.role).toBe('admin');
        });
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            mockUserQueries.getUserByEmailWithPassword.mockResolvedValue({
                id: 1,
                email: 'test@company.com',
                password_hash: 'hashedPassword',
                role: 'employee'
            });
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(true as any);

            const result = await authService.login({
                email: 'test@company.com',
                password: 'Password123'
            });

            expect(result.user.email).toBe('test@company.com');
            expect(result.token).toBeDefined();
        });

        it('should normalize email during login', async () => {
            mockUserQueries.getUserByEmailWithPassword.mockResolvedValue({
                id: 1,
                email: 'test@company.com',
                password_hash: 'hashedPassword',
                role: 'employee'
            });
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(true as any);

            await authService.login({
                email: 'TEST@COMPANY.COM',
                password: 'Password123'
            });

            expect(mockUserQueries.getUserByEmailWithPassword).toHaveBeenCalledWith('test@company.com');
        });

        it('should throw error if email is empty', async () => {
            await expect(
                authService.login({ email: '', password: 'Password123' })
            ).rejects.toThrow('Email is required');
        });

        it('should throw error if password is empty', async () => {
            await expect(
                authService.login({ email: 'test@company.com', password: '' })
            ).rejects.toThrow('Password is required');
        });

        it('should throw error if user not found', async () => {
            mockUserQueries.getUserByEmailWithPassword.mockResolvedValue(null);

            await expect(
                authService.login({ email: 'notfound@company.com', password: 'Password123' })
            ).rejects.toThrow('Invalid email or password');
        });

        it('should throw error if password is incorrect', async () => {
            mockUserQueries.getUserByEmailWithPassword.mockResolvedValue({
                id: 1,
                email: 'test@company.com',
                password_hash: 'hashedPassword',
                role: 'employee'
            });
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(false as any);

            await expect(
                authService.login({ email: 'test@company.com', password: 'WrongPassword' })
            ).rejects.toThrow('Invalid email or password');
        });
    });

    describe('signToken', () => {
        it('should generate a JWT token with correct payload', () => {
            const payload = {
                userId: 1,
                email: 'test@company.com',
                role: 'employee' as const
            };

            const token = authService.signToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });
});
