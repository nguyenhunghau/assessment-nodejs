import { z } from 'zod';

// Validation schema for creating an employee
export const createEmployeeSchema = z.object({
  user_id: z.coerce.number({
    invalid_type_error: 'User ID must be a valid number',
  }).int('User ID must be an integer').positive('User ID must be positive'),
  
  first_name: z.string({
    message: 'First name must be a string',
  }).min(1, 'First name cannot be empty').max(100, 'First name must be 100 characters or less'),
  
  last_name: z.string({
    message: 'Last name must be a string',
  }).min(1, 'Last name cannot be empty').max(100, 'Last name must be 100 characters or less'),
  
  department: z.string().max(100, 'Department must be 100 characters or less').optional(),
  
  position: z.string().max(100, 'Position must be 100 characters or less').optional(),
});

// Validation schema for updating an employee
export const updateEmployeeSchema = z.object({
  user_id: z.coerce.number({
    invalid_type_error: 'User ID must be a valid number',
  }).int('User ID must be an integer').positive('User ID must be positive').optional(),
  
  first_name: z.string({
    message: 'First name must be a string',
  }).min(1, 'First name cannot be empty').max(100, 'First name must be 100 characters or less').optional(),
  
  last_name: z.string({
    message: 'Last name must be a string',
  }).min(1, 'Last name cannot be empty').max(100, 'Last name must be 100 characters or less').optional(),
  
  department: z.string().max(100, 'Department must be 100 characters or less').optional(),
  
  position: z.string().max(100, 'Position must be 100 characters or less').optional(),
}).strict().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Validation schema for employee ID parameter
export const employeeIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Employee ID must be a valid number').transform(Number),
});

// Validation schema for pagination query parameters
export const employeePaginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive number').default('1').transform(Number).refine(n => n > 0, 'Page must be greater than 0'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').default('10').transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100'),
});
