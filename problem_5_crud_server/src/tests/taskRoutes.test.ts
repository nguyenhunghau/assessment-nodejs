import request from 'supertest';
import app from '../app';

jest.mock('../service/taskService', () => ({
  createTask: jest.fn(),
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

import * as taskService from '../service/taskService';
const mockTaskService = taskService as jest.Mocked<typeof taskService>;

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(() => ({
    userId: 1,
    email: 'user@company.com',
    role: 'employee',
  })),
}));

const token = 'Bearer valid-token';

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require auth', async () => {
    await request(app).get('/tasks').expect(401);
  });

  it('should list tasks assigned to user', async () => {
    mockTaskService.getTasks.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    } as any);

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', token)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(mockTaskService.getTasks).toHaveBeenCalledWith(
      expect.objectContaining({ assignedToUserId: 1 })
    );
  });

  it('should create task (defaults assigned_to_user_id to self)', async () => {
    mockTaskService.createTask.mockResolvedValue({
      id: 1,
      title: 'Do thing',
      status: 'todo',
      priority: 'medium',
      assigned_to_user_id: 1,
      created_by_user_id: 1,
    } as any);

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', token)
      .send({ title: 'Do thing' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(mockTaskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Do thing',
        assigned_to_user_id: 1,
        created_by_user_id: 1,
      })
    );
  });
});
