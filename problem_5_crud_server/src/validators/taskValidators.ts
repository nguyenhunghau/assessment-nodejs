import { z } from 'zod';

// Validation schema for creating a task
export const createTaskSchema = z.object({
  title: z.string({
    message: 'Title must be a string',
  }).min(1, 'Title cannot be empty').max(255, 'Title must be 255 characters or less'),
  
  description: z.string({
    message: 'Description must be a string',
  }).max(1000, 'Description must be 1000 characters or less').optional(),
  
  status: z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
  
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  
  due_date: z.string({
    message: 'Due date must be a string',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in format YYYY-MM-DD').refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Due date must be a valid date').optional(),
  
  assigned_to_user_id: z.number({
    message: 'Assigned to user ID must be a number',
  }).int('Assigned to user ID must be an integer').positive('Assigned to user ID must be positive').optional(),
});

// Validation schema for updating a task
export const updateTaskSchema = z.object({
  title: z.string({
    message: 'Title must be a string',
  }).min(1, 'Title cannot be empty').max(255, 'Title must be 255 characters or less').optional(),
  
  description: z.string({
    message: 'Description must be a string',
  }).max(1000, 'Description must be 1000 characters or less').optional().nullable(),
  
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  
  priority: z.enum(['low', 'medium', 'high']).optional(),
  
  due_date: z.string({
    message: 'Due date must be a string',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in format YYYY-MM-DD').refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Due date must be a valid date').optional().nullable(),
  
  assigned_to_user_id: z.number({
    message: 'Assigned to user ID must be a number',
  }).int('Assigned to user ID must be an integer').positive('Assigned to user ID must be positive').optional(),
}).strict().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Validation schema for task ID parameter
export const taskIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Task ID must be a valid number').transform(Number),
});

// Validation schema for task query/filter parameters
export const taskQuerySchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a positive number').default('1').transform(Number).refine(n => n > 0, 'Page must be greater than 0'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').default('10').transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100'),
});
