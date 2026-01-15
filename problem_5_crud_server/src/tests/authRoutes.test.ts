import request from 'supertest';
import app from '../app';

jest.mock('../service/authService', () => ({
  register: jest.fn(),
  login: jest.fn(),
}));

import * as authService from '../service/authService';
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register successfully', async () => {
      mockAuthService.register.mockResolvedValue({
        user: { id: 1, email: 'user@company.com', role: 'employee' },
        token: 'token123',
      });

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'user@company.com', password: 'Password123' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        user: { id: 1, email: 'user@company.com', role: 'employee' },
        token: 'token123',
      });
    });

    it('should return 400 on error', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('Email already registered')
      );

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'user@company.com', password: 'Password123' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Email already registered',
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: 1, email: 'user@company.com', role: 'employee' },
        token: 'token123',
      });

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'user@company.com', password: 'Password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('token123');
    });

    it('should return 401 on invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new Error('Invalid email or password')
      );

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'user@company.com', password: 'bad' })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid email or password',
      });
    });
  });
});
