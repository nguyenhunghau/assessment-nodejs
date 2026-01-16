import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '../util/logger';

export const validate = (
  schema: z.ZodSchema,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      
      // Parse and validate the data
      const validated = await schema.parseAsync(dataToValidate);
      
      // Replace the request data with validated data
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn(`Validation failed for ${source}`, { errors });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      
      logger.error('Unexpected validation error', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during validation',
      });
    }
  };
};
