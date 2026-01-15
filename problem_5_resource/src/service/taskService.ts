import { Task, TaskPriority, TaskStatus } from '../types';
import { taskQueries, TaskFilters } from '../queries/taskQueries';
import { userQueries } from '../queries/userQueries';
import { logger } from '../util/logger';

export async function createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
        logger.debug('Creating task', { title: data.title, assignedTo: data.assigned_to_user_id, createdBy: data.created_by_user_id });
        
        if (!data.title?.trim()) {
            logger.warn('Task creation failed: Title is required');
            throw new Error('title is required');
        }

        const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
        if (data.status && !validStatuses.includes(data.status)) {
            logger.warn('Task creation failed: Invalid status', { status: data.status });
            throw new Error('Invalid status. Must be one of: todo, in_progress, done');
        }

        const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];
        if (data.priority && !validPriorities.includes(data.priority)) {
            logger.warn('Task creation failed: Invalid priority', { priority: data.priority });
            throw new Error('Invalid priority. Must be one of: low, medium, high');
        }

        if (!data.assigned_to_user_id || data.assigned_to_user_id <= 0) {
            logger.warn('Task creation failed: Invalid assigned_to_user_id', { assignedTo: data.assigned_to_user_id });
            throw new Error('Valid assigned_to_user_id is required');
        }

        // Validate assigned user exists
        const assignedUserExists = await userQueries.userExistsById(data.assigned_to_user_id);
        if (!assignedUserExists) {
            logger.warn('Task creation failed: Assigned user does not exist', { assignedTo: data.assigned_to_user_id });
            throw new Error('Assigned user does not exist');
        }

        if (!data.created_by_user_id || data.created_by_user_id <= 0) {
            logger.warn('Task creation failed: Invalid created_by_user_id', { createdBy: data.created_by_user_id });
            throw new Error('Valid created_by_user_id is required');
        }

        try {
            const task = await taskQueries.createTask(data);
            logger.info('Task created successfully', { taskId: task.id, title: data.title });
            return task;
        } catch (error) {
            logger.error('Failed to create task', error, { title: data.title });
            throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

export async function getTasks(filters: TaskFilters = {}): Promise<{ data: Task[]; total: number; page?: number; totalPages?: number }> {
        logger.debug('Fetching tasks', { filters });
        
        try {
            const limit = filters.limit || 10;
            const offset = filters.offset || 0;
            const page = Math.floor(offset / limit) + 1;

            const result = await taskQueries.getTasks({ ...filters, limit, offset });
            const totalPages = Math.ceil(result.total / limit);

            logger.info('Tasks fetched successfully', { count: result.data.length, total: result.total, page });
            return { ...result, page, totalPages };
        } catch (error) {
            logger.error('Failed to fetch tasks', error, { filters });
            throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

export async function getTaskById(id: number): Promise<Task> {
        logger.debug('Fetching task by ID', { taskId: id });
        
        if (!id || id <= 0) {
            logger.warn('Task fetch failed: Invalid ID', { taskId: id });
            throw new Error('Valid task ID is required');
        }

        const task = await taskQueries.getTaskById(id);
        if (!task) {
            logger.warn('Task fetch failed: Not found', { taskId: id });
            throw new Error('Task not found');
        }
        
        logger.info('Task fetched successfully', { taskId: id });
        return task;
    }

export async function updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> {
        logger.debug('Updating task', { taskId: id, updates });
        
        if (!id || id <= 0) {
            logger.warn('Task update failed: Invalid ID', { taskId: id });
            throw new Error('Valid task ID is required');
        }

        const exists = await taskQueries.taskExists(id);
        if (!exists) {
            logger.warn('Task update failed: Not found', { taskId: id });
            throw new Error('Task not found');
        }

        if (updates.status) {
            const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
            if (!validStatuses.includes(updates.status)) {
                logger.warn('Task update failed: Invalid status', { taskId: id, status: updates.status });
                throw new Error('Invalid status. Must be one of: todo, in_progress, done');
            }
        }

        if (updates.priority) {
            const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];
            if (!validPriorities.includes(updates.priority)) {
                logger.warn('Task update failed: Invalid priority', { taskId: id, priority: updates.priority });
                throw new Error('Invalid priority. Must be one of: low, medium, high');
            }
        }

        // Validate assigned_to_user_id if being updated
        if (updates.assigned_to_user_id !== undefined) {
            const userExists = await userQueries.userExistsById(updates.assigned_to_user_id);
            if (!userExists) {
                logger.warn('Task update failed: Assigned user does not exist', { taskId: id, assignedTo: updates.assigned_to_user_id });
                throw new Error('Assigned user does not exist');
            }
        }

        const updated = await taskQueries.updateTask(id, updates);
        if (!updated) {
            logger.error('Failed to update task', null, { taskId: id });
            throw new Error('Failed to update task');
        }

        logger.info('Task updated successfully', { taskId: id });
        return updated;
    }

export async function deleteTask(id: number): Promise<void> {
    logger.debug('Deleting task', { taskId: id });
    
    if (!id || id <= 0) {
        logger.warn('Task deletion failed: Invalid ID', { taskId: id });
        throw new Error('Valid task ID is required');
    }

    const exists = await taskQueries.taskExists(id);
    if (!exists) {
        logger.warn('Task deletion failed: Not found', { taskId: id });
        throw new Error('Task not found');
    }

    const deleted = await taskQueries.deleteTask(id);
    if (!deleted) {
        logger.error('Failed to delete task', null, { taskId: id });
        throw new Error('Failed to delete task');
    }
    
    logger.info('Task deleted successfully', { taskId: id });
}
