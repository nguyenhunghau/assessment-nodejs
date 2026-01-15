import { Request, Response } from 'express';
import * as taskService from '../service/taskService';
import { Task } from '../types';
import { logger } from '../util/logger';

export const TaskController = {
    create: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                logger.warn('Create task failed: Unauthorized');
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const body = req.body as Partial<Task>;

            const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
                title: body.title || '',
                description: body.description,
                status: (body.status as any) || 'todo',
                priority: (body.priority as any) || 'medium',
                due_date: body.due_date,
                assigned_to_user_id: body.assigned_to_user_id || req.user.id,
                created_by_user_id: req.user.id
            };

            logger.debug('Create task request received', { title: taskData.title, createdBy: req.user.id });
            const task = await taskService.createTask(taskData);

            logger.info('Create task request successful', { taskId: task.id, createdBy: req.user.id });
            return res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task
            });
        } catch (error) {
            logger.warn('Create task request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create task'
            });
        }
    },

    list: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                logger.warn('List tasks failed: Unauthorized');
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const { status, page = '1', limit = '10' } = req.query;
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const offset = (pageNum - 1) * limitNum;

            logger.debug('List tasks request received', { userId: req.user.id, filters: { status, page, limit } });
            const filters: any = {
                status: status as any,
                assignedToUserId: req.user.id,
                limit: limitNum,
                offset
            };

            Object.keys(filters).forEach((key) => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await taskService.getTasks(filters);

            logger.info('List tasks request successful', { userId: req.user.id, count: result.data.length, total: result.total });
            return res.status(200).json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit: limitNum
                }
            });
        } catch (error) {
            logger.error('List tasks request failed', error);
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch tasks'
            });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                logger.warn('Get task by ID failed: Unauthorized');
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                logger.warn('Get task by ID failed: Invalid ID', { id: req.params.id });
                return res.status(400).json({
                    success: false,
                    message: 'Invalid task ID'
                });
            }

            logger.debug('Get task by ID request received', { taskId: id, userId: req.user.id });
            const task = await taskService.getTaskById(id);

            if (task.assigned_to_user_id !== req.user.id && task.created_by_user_id !== req.user.id) {
                logger.warn('Get task by ID failed: Forbidden', { taskId: id, userId: req.user.id });
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            }

            logger.info('Get task by ID request successful', { taskId: id, userId: req.user.id });
            return res.status(200).json({
                success: true,
                message: 'Task retrieved successfully',
                data: task
            });
        } catch (error) {
            logger.warn('Get task by ID request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch task'
            });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                logger.warn('Update task failed: Unauthorized');
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                logger.warn('Update task failed: Invalid ID', { id: req.params.id });
                return res.status(400).json({
                    success: false,
                    message: 'Invalid task ID'
                });
            }

            logger.debug('Update task request received', { taskId: id, userId: req.user.id });
            const existing = await taskService.getTaskById(id);
            if (existing.assigned_to_user_id !== req.user.id && existing.created_by_user_id !== req.user.id) {
                logger.warn('Update task failed: Forbidden', { taskId: id, userId: req.user.id });
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            const updates: Partial<Omit<Task, 'id' | 'created_at'>> = req.body;
            const task = await taskService.updateTask(id, updates);

            logger.info('Update task request successful', { taskId: id, userId: req.user.id });
            return res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: task
            });
        } catch (error) {
            logger.warn('Update task request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update task'
            });
        }
    },

    remove: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                logger.warn('Delete task failed: Unauthorized');
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                logger.warn('Delete task failed: Invalid ID', { id: req.params.id });
                return res.status(400).json({
                    success: false,
                    message: 'Invalid task ID'
                });
            }

            logger.debug('Delete task request received', { taskId: id, userId: req.user.id });
            const existing = await taskService.getTaskById(id);
            if (existing.assigned_to_user_id !== req.user.id && existing.created_by_user_id !== req.user.id) {
                logger.warn('Delete task failed: Forbidden', { taskId: id, userId: req.user.id });
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            await taskService.deleteTask(id);

            logger.info('Delete task request successful', { taskId: id, userId: req.user.id });
            return res.status(200).json({
                success: true,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            logger.warn('Delete task request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete task'
            });
        }
    }
};
