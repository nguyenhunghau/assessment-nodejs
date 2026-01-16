import { z } from 'zod';

// Validation schema for user registration
export const registerSchema = z.object({
  email: z.string({
    message: 'Email must be a string',
  }).email('Invalid email format').min(1, 'Email cannot be empty').max(255, 'Email must be 255 characters or less'),
  
  password: z.string({
    message: 'Password must be a string',
  }).min(6, 'Password must be at least 6 characters').max(100, 'Password must be 100 characters or less'),
  
  role: z.enum(['admin', 'employee']).optional().default('employee'),
});

// Validation schema for user login
export const loginSchema = z.object({
  email: z.string({
    message: 'Email must be a string',
  }).email('Invalid email format').min(1, 'Email cannot be empty'),
  
  password: z.string({
    message: 'Password must be a string',
  }).min(1, 'Password cannot be empty'),
});
