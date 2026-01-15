import * as taskService from '../service/taskService';
import { taskQueries } from '../queries/taskQueries';

jest.mock('../queries/taskQueries');

const mockTaskQueries = taskQueries as jest.Mocked<typeof taskQueries>;

describe('taskService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create task successfully', async () => {
            const taskData = {
                title: 'Complete onboarding',
                description: 'Read handbook',
                status: 'todo' as const,
                priority: 'high' as const,
                due_date: '2026-01-21',
                assigned_to_user_id: 2,
                created_by_user_id: 1
            };

            mockTaskQueries.createTask.mockResolvedValue({
                id: 1,
                ...taskData,
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await taskService.createTask(taskData);

            expect(result.id).toBe(1);
            expect(result.title).toBe('Complete onboarding');
            expect(mockTaskQueries.createTask).toHaveBeenCalledWith(taskData);
        });

        it('should throw error if title is empty', async () => {
            await expect(
                taskService.createTask({
                    title: '',
                    status: 'todo',
                    priority: 'medium',
                    assigned_to_user_id: 1,
                    created_by_user_id: 1
                })
            ).rejects.toThrow('title is required');
        });

        it('should throw error if status is invalid', async () => {
            await expect(
                taskService.createTask({
                    title: 'Task',
                    status: 'invalid' as any,
                    priority: 'medium',
                    assigned_to_user_id: 1,
                    created_by_user_id: 1
                })
            ).rejects.toThrow('Invalid status');
        });

        it('should throw error if priority is invalid', async () => {
            await expect(
                taskService.createTask({
                    title: 'Task',
                    status: 'todo',
                    priority: 'invalid' as any,
                    assigned_to_user_id: 1,
                    created_by_user_id: 1
                })
            ).rejects.toThrow('Invalid priority');
        });

        it('should throw error if assigned_to_user_id is invalid', async () => {
            await expect(
                taskService.createTask({
                    title: 'Task',
                    status: 'todo',
                    priority: 'medium',
                    assigned_to_user_id: 0,
                    created_by_user_id: 1
                })
            ).rejects.toThrow('Valid assigned_to_user_id is required');
        });

        it('should throw error if created_by_user_id is invalid', async () => {
            await expect(
                taskService.createTask({
                    title: 'Task',
                    status: 'todo',
                    priority: 'medium',
                    assigned_to_user_id: 1,
                    created_by_user_id: 0
                })
            ).rejects.toThrow('Valid created_by_user_id is required');
        });

        it('should handle database errors', async () => {
            mockTaskQueries.createTask.mockRejectedValue(new Error('DB error'));

            await expect(
                taskService.createTask({
                    title: 'Task',
                    status: 'todo',
                    priority: 'medium',
                    assigned_to_user_id: 1,
                    created_by_user_id: 1
                })
            ).rejects.toThrow('Failed to create task');
        });
    });

    describe('getTasks', () => {
        it('should return paginated tasks', async () => {
            const mockTasks = {
                data: [
                    {
                        id: 1,
                        title: 'Task 1',
                        status: 'todo' as const,
                        priority: 'high' as const,
                        assigned_to_user_id: 1,
                        created_by_user_id: 1,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ],
                total: 1
            };

            mockTaskQueries.getTasks.mockResolvedValue(mockTasks);

            const result = await taskService.getTasks({ limit: 10, offset: 0 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
        });

        it('should apply default pagination', async () => {
            mockTaskQueries.getTasks.mockResolvedValue({ data: [], total: 0 });

            await taskService.getTasks({});

            expect(mockTaskQueries.getTasks).toHaveBeenCalledWith({
                limit: 10,
                offset: 0
            });
        });

        it('should filter by status', async () => {
            mockTaskQueries.getTasks.mockResolvedValue({ data: [], total: 0 });

            await taskService.getTasks({ status: 'in_progress' });

            expect(mockTaskQueries.getTasks).toHaveBeenCalledWith({
                status: 'in_progress',
                limit: 10,
                offset: 0
            });
        });

        it('should calculate correct page numbers', async () => {
            mockTaskQueries.getTasks.mockResolvedValue({
                data: [],
                total: 25
            });

            const result = await taskService.getTasks({ limit: 10, offset: 10 });

            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(3);
        });

        it('should handle database errors', async () => {
            mockTaskQueries.getTasks.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getTasks({})).rejects.toThrow('Failed to fetch tasks');
        });
    });

    describe('getTaskById', () => {
        it('should return task by id', async () => {
            const mockTask = {
                id: 1,
                title: 'Task 1',
                status: 'todo' as const,
                priority: 'high' as const,
                assigned_to_user_id: 1,
                created_by_user_id: 1,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockTaskQueries.getTaskById.mockResolvedValue(mockTask);

            const result = await taskService.getTaskById(1);

            expect(result.id).toBe(1);
            expect(result.title).toBe('Task 1');
        });

        it('should throw error if id is invalid', async () => {
            await expect(taskService.getTaskById(0)).rejects.toThrow('Valid task ID is required');
        });

        it('should throw error if task not found', async () => {
            mockTaskQueries.getTaskById.mockResolvedValue(null);

            await expect(taskService.getTaskById(999)).rejects.toThrow('Task not found');
        });
    });

    describe('updateTask', () => {
        it('should update task successfully', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(true);
            mockTaskQueries.updateTask.mockResolvedValue({
                id: 1,
                title: 'Updated Task',
                status: 'in_progress',
                priority: 'high',
                assigned_to_user_id: 1,
                created_by_user_id: 1,
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await taskService.updateTask(1, {
                title: 'Updated Task',
                status: 'in_progress'
            });

            expect(result.title).toBe('Updated Task');
            expect(result.status).toBe('in_progress');
        });

        it('should throw error if id is invalid', async () => {
            await expect(
                taskService.updateTask(0, { title: 'Task' })
            ).rejects.toThrow('Valid task ID is required');
        });

        it('should throw error if task not found', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(false);

            await expect(
                taskService.updateTask(999, { title: 'Task' })
            ).rejects.toThrow('Task not found');
        });

        it('should validate status when updating', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(true);

            await expect(
                taskService.updateTask(1, { status: 'invalid' as any })
            ).rejects.toThrow('Invalid status');
        });

        it('should validate priority when updating', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(true);

            await expect(
                taskService.updateTask(1, { priority: 'invalid' as any })
            ).rejects.toThrow('Invalid priority');
        });

        it('should throw error if update fails', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(true);
            mockTaskQueries.updateTask.mockResolvedValue(null);

            await expect(
                taskService.updateTask(1, { title: 'Task' })
            ).rejects.toThrow('Failed to update task');
        });
    });

    describe('deleteTask', () => {
        it('should delete task successfully', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(true);
            mockTaskQueries.deleteTask.mockResolvedValue(true);

            await taskService.deleteTask(1);

            expect(mockTaskQueries.deleteTask).toHaveBeenCalledWith(1);
        });

        it('should throw error if id is invalid', async () => {
            await expect(taskService.deleteTask(0)).rejects.toThrow('Valid task ID is required');
        });

        it('should throw error if task not found', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(false);

            await expect(taskService.deleteTask(999)).rejects.toThrow('Task not found');
        });

        it('should throw error if delete fails', async () => {
            mockTaskQueries.taskExists.mockResolvedValue(true);
            mockTaskQueries.deleteTask.mockResolvedValue(false);

            await expect(taskService.deleteTask(1)).rejects.toThrow('Failed to delete task');
        });
    });
});
