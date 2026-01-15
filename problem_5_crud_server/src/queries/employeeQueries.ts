import database from '../db/database';
import { Employee } from '../types';

export const employeeQueries = {
  createEmployee: async (
    employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Employee> => {
    const [created] = await database('employees')
      .insert({
        ...employee,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    return created;
  },

  getEmployees: async (options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: Employee[]; total: number }> => {
    const { limit, offset } = options || {};

    // Get total count
    const [{ count }] = await database('employees').count('* as count');
    const total = parseInt(count as string);

    // Get paginated data
    let query = database('employees').orderBy('created_at', 'desc');

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const data = await query;

    return { data, total };
  },

  getEmployeeById: async (id: number): Promise<Employee | null> => {
    const row = await database('employees').where({ id }).first();
    return row || null;
  },

  updateEmployee: async (
    id: number,
    updates: Partial<Omit<Employee, 'id' | 'created_at'>>
  ): Promise<Employee | null> => {
    const [updated] = await database('employees')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');
    return updated || null;
  },

  deleteEmployee: async (id: number): Promise<boolean> => {
    const deleted = await database('employees').where({ id }).del();
    return deleted > 0;
  },

  employeeExists: async (id: number): Promise<boolean> => {
    const row = await database('employees').where({ id }).first();
    return !!row;
  },

  employeeExistsByUserId: async (userId: number): Promise<boolean> => {
    const row = await employeeQueries.getEmployeeByUserId(userId);
    return !!row;
  },

  getEmployeeByUserId: async (userId: number): Promise<Employee | null> => {
    const row = await database('employees').where({ user_id: userId }).first();
    return row || null;
  },
};
