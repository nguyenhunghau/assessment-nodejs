import { Request, Response } from 'express';
import * as authService from '../service/authService';
import { logger } from '../util/logger';

export const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body as { email?: string; password?: string; role?: 'admin' | 'employee' };
      logger.debug('Register request received', { email });
      
      const result = await authService.register({ email: email || '', password: password || '', role });

      logger.info('Register request successful', { email: result.user.email });
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      logger.warn('Register request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register user'
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      logger.debug('Login request received', { email });
      
      const result = await authService.login({ email: email || '', password: password || '' });

      logger.info('Login request successful', { email: result.user.email });
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.warn('Login request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid email or password'
      });
    }
  }
};
