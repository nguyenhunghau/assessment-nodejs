import { Employee } from '../types';
import { employeeQueries } from '../queries/employeeQueries';
import { userQueries } from '../queries/userQueries';
import { logger } from '../util/logger';

export async function createEmployee(data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    logger.debug('Creating employee', { userId: data.user_id, name: `${data.first_name} ${data.last_name}` });
    
    if (!data.user_id || data.user_id <= 0) {
        logger.warn('Employee creation failed: Invalid user_id', { userId: data.user_id });
        throw new Error('Valid user_id is required');
    }

    // Validate user exists
    const userExists = await userQueries.userExistsById(data.user_id);
    if (!userExists) {
        logger.warn('Employee creation failed: User does not exist', { userId: data.user_id });
        throw new Error('User does not exist');
    }

    if (!data.first_name || !data.last_name) {
        logger.warn('Employee creation failed: Missing name', { userId: data.user_id });
        throw new Error('first_name and last_name are required');
    }

    try {
        const employee = await employeeQueries.createEmployee(data);
        logger.info('Employee created successfully', { employeeId: employee.id, userId: data.user_id });
        return employee;
    } catch (error) {
        logger.error('Failed to create employee', error, { userId: data.user_id });
        throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getEmployees(options?: { limit?: number; offset?: number }): Promise<{ data: Employee[]; total: number; page?: number; totalPages?: number }> {
    logger.debug('Fetching all employees', { options });
    
    try {
        const limit = options?.limit || 10;
        const offset = options?.offset || 0;
        const page = Math.floor(offset / limit) + 1;
        
        const result = await employeeQueries.getEmployees({ limit, offset });
        const totalPages = Math.ceil(result.total / limit);
        
        logger.info('Employees fetched successfully', { count: result.data.length, total: result.total, page });
        return { ...result, page, totalPages };
    } catch (error) {
        logger.error('Failed to fetch employees', error);
        throw new Error(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getEmployeeById(id: number): Promise<Employee> {
    if (!id || id <= 0) {
        throw new Error('Valid employee ID is required');
    }

    const employee = await employeeQueries.getEmployeeById(id);
    if (!employee) {
        throw new Error('Employee not found');
    }
    return employee;
}

export async function updateEmployee(id: number, updates: Partial<Omit<Employee, 'id' | 'created_at'>>): Promise<Employee> {
    logger.debug('Updating employee', { employeeId: id, updates });
    
    if (!id || id <= 0) {
        logger.warn('Employee update failed: Invalid ID', { employeeId: id });
        throw new Error('Valid employee ID is required');
    }

    const exists = await employeeQueries.employeeExists(id);
    if (!exists) {
        logger.warn('Employee update failed: Not found', { employeeId: id });
        throw new Error('Employee not found');
    }

    // Validate user_id if being updated
    if (updates.user_id !== undefined) {
        const userExists = await userQueries.userExistsById(updates.user_id);
        if (!userExists) {
            logger.warn('Employee update failed: User does not exist', { employeeId: id, userId: updates.user_id });
            throw new Error('User does not exist');
        }
    }

    const updated = await employeeQueries.updateEmployee(id, updates);
    if (!updated) {
        logger.error('Failed to update employee', null, { employeeId: id });
        throw new Error('Failed to update employee');
    }
    
    logger.info('Employee updated successfully', { employeeId: id });
    return updated;
}

export async function deleteEmployee(id: number): Promise<void> {
    logger.debug('Deleting employee', { employeeId: id });
    
    if (!id || id <= 0) {
        logger.warn('Employee deletion failed: Invalid ID', { employeeId: id });
        throw new Error('Valid employee ID is required');
    }

    const exists = await employeeQueries.employeeExists(id);
    if (!exists) {
        logger.warn('Employee deletion failed: Not found', { employeeId: id });
        throw new Error('Employee not found');
    }

    const deleted = await employeeQueries.deleteEmployee(id);
    if (!deleted) {
        logger.error('Failed to delete employee', null, { employeeId: id });
        throw new Error('Failed to delete employee');
    }
    
    logger.info('Employee deleted successfully', { employeeId: id });
}
