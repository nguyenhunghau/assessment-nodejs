import { Request, Response } from 'express';
import * as employeeService from '../service/employeeService';
import { Employee } from '../types';
import { logger } from '../util/logger';

export const EmployeeController = {
  create: async (req: Request, res: Response) => {
    try {
      // Permission check: Only admin can create employees
      if (!req.user) {
        logger.warn('Create employee failed: Unauthorized');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (req.user.role !== 'admin') {
        logger.error(
          'Create employee failed: Forbidden - admin role required',
          {
            userId: req.user.id,
            role: req.user.role,
          }
        );
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only administrators can create employees',
        });
      }

      // req.body is already validated by middleware
      const employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'> =
        req.body;
      logger.debug('Create employee request received', {
        userId: employeeData.user_id,
        adminId: req.user.id,
      });

      const employee = await employeeService.createEmployee(employeeData);

      logger.info('Create employee request successful', {
        employeeId: employee.id,
        adminId: req.user.id,
      });
      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      logger.warn('Create employee request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to create employee',
      });
    }
  },

  list: async (req: Request, res: Response) => {
    try {
      // req.query is already validated and transformed by middleware
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const offset = (page - 1) * limit;

      logger.debug('List employees request received', {
        page,
        limit,
      });
      const result = await employeeService.getEmployees({
        limit,
        offset,
      });

      logger.info('List employees request successful', {
        count: result.data.length,
        total: result.total,
        page: result.page,
      });
      return res.status(200).json({
        success: true,
        message: 'Employees retrieved successfully',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('List employees request failed', error);
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch employees',
      });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      // req.params is already validated and transformed by middleware
      const { id } = req.params as unknown as { id: number };

      logger.debug('Get employee by ID request received', { employeeId: id });
      const employee = await employeeService.getEmployeeById(id);
      logger.info('Get employee by ID request successful', { employeeId: id });
      return res.status(200).json({
        success: true,
        message: 'Employee retrieved successfully',
        data: employee,
      });
    } catch (error) {
      logger.warn('Get employee by ID request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      const statusCode =
        error instanceof Error && error.message === 'Employee not found'
          ? 404
          : 500;
      return res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch employee',
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      // Permission check: Must be authenticated
      if (!req.user) {
        logger.warn('Update employee failed: Unauthorized');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // req.params and req.body are already validated by middleware
      const { id } = req.params as unknown as { id: number };

      // Check if user has permission to update this employee
      // Admin can update any employee, regular employee can only update their own
      if (req.user.role !== 'admin') {
        // Get the employee to check if user_id matches
        const existingEmployee = await employeeService.getEmployeeById(id);

        if (existingEmployee.user_id !== req.user.id) {
          logger.error(
            'Update employee failed: Forbidden - can only update own record',
            {
              userId: req.user.id,
              employeeUserId: existingEmployee.user_id,
              employeeId: id,
            }
          );
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only update your own employee record',
          });
        }
      }

      const updates: Partial<Omit<Employee, 'id' | 'created_at'>> = req.body;
      logger.debug('Update employee request received', {
        employeeId: id,
        userId: req.user.id,
        role: req.user.role,
      });

      const employee = await employeeService.updateEmployee(id, updates);

      logger.info('Update employee request successful', {
        employeeId: id,
        userId: req.user.id,
      });
      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      logger.warn('Update employee request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      const statusCode =
        error instanceof Error && error.message === 'Employee not found'
          ? 404
          : 400;
      return res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to update employee',
      });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      // Permission check: Only admin can delete employees
      if (!req.user) {
        logger.warn('Delete employee failed: Unauthorized');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (req.user.role !== 'admin') {
        logger.error(
          'Delete employee failed: Forbidden - admin role required',
          {
            userId: req.user.id,
            role: req.user.role,
          }
        );
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only administrators can delete employees',
        });
      }

      // req.params is already validated and transformed by middleware
      const { id } = req.params as unknown as { id: number };

      logger.debug('Delete employee request received', {
        employeeId: id,
        adminId: req.user.id,
      });
      await employeeService.deleteEmployee(id);

      logger.info('Delete employee request successful', {
        employeeId: id,
        adminId: req.user.id,
      });
      return res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === 'Employee not found'
          ? 404
          : 500;
      return res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to delete employee',
      });
    }
  },
};
