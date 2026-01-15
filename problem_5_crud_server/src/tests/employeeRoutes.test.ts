import request from 'supertest';
import app from '../app';

jest.mock('../service/employeeService', () => ({
  createEmployee: jest.fn(),
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
}));

import * as employeeService from '../service/employeeService';
const mockEmployeeService = employeeService as jest.Mocked<
  typeof employeeService
>;

const employeeToken = 'Bearer employee-token';
const adminToken = 'Bearer admin-token';

// Mock JWT with role-based responses
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token: string) => {
    if (token === 'admin-token') {
      return { userId: 1, email: 'admin@company.com', role: 'admin' };
    }
    return { userId: 2, email: 'user@company.com', role: 'employee' };
  }),
}));

describe('Employee Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require auth', async () => {
    await request(app).get('/employees').expect(401);
  });

  it('should list employees', async () => {
    mockEmployeeService.getEmployees.mockResolvedValue({
      data: [
        {
          id: 1,
          user_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          department: 'IT',
          position: 'Dev',
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    } as any);

    const res = await request(app)
      .get('/employees')
      .set('Authorization', employeeToken)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
    expect(mockEmployeeService.getEmployees).toHaveBeenCalled();
  });

  describe('Admin permissions', () => {
    it('should allow admin to create employee', async () => {
      mockEmployeeService.createEmployee.mockResolvedValue({
        id: 2,
        user_id: 3,
        first_name: 'Jane',
        last_name: 'Smith',
      } as any);

      const res = await request(app)
        .post('/employees')
        .set('Authorization', adminToken)
        .send({ user_id: 3, first_name: 'Jane', last_name: 'Smith' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(mockEmployeeService.createEmployee).toHaveBeenCalled();
    });

    it('should allow admin to update any employee', async () => {
      mockEmployeeService.getEmployeeById.mockResolvedValue({
        id: 2,
        user_id: 3,
        first_name: 'Jane',
        last_name: 'Smith',
      } as any);

      mockEmployeeService.updateEmployee.mockResolvedValue({
        id: 2,
        user_id: 3,
        first_name: 'Jane',
        last_name: 'Updated',
      } as any);

      const res = await request(app)
        .put('/employees/2')
        .set('Authorization', adminToken)
        .send({ last_name: 'Updated' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockEmployeeService.updateEmployee).toHaveBeenCalledWith(2, {
        last_name: 'Updated',
      });
    });

    it('should allow admin to delete employee', async () => {
      mockEmployeeService.deleteEmployee.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/employees/2')
        .set('Authorization', adminToken)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(2);
    });
  });

  describe('Employee permissions', () => {
    it('should deny employee from creating employee', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', employeeToken)
        .send({ user_id: 3, first_name: 'Jane', last_name: 'Smith' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('administrator');
      expect(mockEmployeeService.createEmployee).not.toHaveBeenCalled();
    });

    it('should allow employee to update own record', async () => {
      mockEmployeeService.getEmployeeById.mockResolvedValue({
        id: 1,
        user_id: 2, // Matches the employee token userId
        first_name: 'John',
        last_name: 'Doe',
      } as any);

      mockEmployeeService.updateEmployee.mockResolvedValue({
        id: 1,
        user_id: 2,
        first_name: 'John',
        last_name: 'Updated',
      } as any);

      const res = await request(app)
        .put('/employees/1')
        .set('Authorization', employeeToken)
        .send({ last_name: 'Updated' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockEmployeeService.updateEmployee).toHaveBeenCalled();
    });

    it('should deny employee from updating other employee records', async () => {
      mockEmployeeService.getEmployeeById.mockResolvedValue({
        id: 3,
        user_id: 4, // Different from employee token userId (2)
        first_name: 'Other',
        last_name: 'User',
      } as any);

      const res = await request(app)
        .put('/employees/3')
        .set('Authorization', employeeToken)
        .send({ last_name: 'Updated' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('own employee record');
      expect(mockEmployeeService.updateEmployee).not.toHaveBeenCalled();
    });

    it('should deny employee from deleting employee', async () => {
      const res = await request(app)
        .delete('/employees/1')
        .set('Authorization', employeeToken)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('administrator');
      expect(mockEmployeeService.deleteEmployee).not.toHaveBeenCalled();
    });
  });
});
