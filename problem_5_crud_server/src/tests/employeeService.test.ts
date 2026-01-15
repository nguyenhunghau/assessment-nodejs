import * as employeeService from '../service/employeeService';
import { employeeQueries } from '../queries/employeeQueries';

jest.mock('../queries/employeeQueries');

const mockEmployeeQueries = employeeQueries as jest.Mocked<typeof employeeQueries>;

describe('employeeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createEmployee', () => {
        it('should create employee successfully', async () => {
            const employeeData = {
                user_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                department: 'Engineering',
                position: 'Developer'
            };

            mockEmployeeQueries.createEmployee.mockResolvedValue({
                id: 1,
                ...employeeData,
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await employeeService.createEmployee(employeeData);

            expect(result.id).toBe(1);
            expect(result.first_name).toBe('John');
            expect(mockEmployeeQueries.createEmployee).toHaveBeenCalledWith(employeeData);
        });

        it('should throw error if user_id is missing', async () => {
            await expect(
                employeeService.createEmployee({
                    user_id: 0,
                    first_name: 'John',
                    last_name: 'Doe'
                })
            ).rejects.toThrow('Valid user_id is required');
        });

        it('should throw error if first_name is missing', async () => {
            await expect(
                employeeService.createEmployee({
                    user_id: 1,
                    first_name: '',
                    last_name: 'Doe'
                })
            ).rejects.toThrow('first_name and last_name are required');
        });

        it('should throw error if last_name is missing', async () => {
            await expect(
                employeeService.createEmployee({
                    user_id: 1,
                    first_name: 'John',
                    last_name: ''
                })
            ).rejects.toThrow('first_name and last_name are required');
        });

        it('should handle database errors', async () => {
            mockEmployeeQueries.createEmployee.mockRejectedValue(new Error('DB error'));

            await expect(
                employeeService.createEmployee({
                    user_id: 1,
                    first_name: 'John',
                    last_name: 'Doe'
                })
            ).rejects.toThrow('Failed to create employee');
        });
    });

    describe('getEmployees', () => {
        it('should return list of employees', async () => {
            const mockEmployees = [
                {
                    id: 1,
                    user_id: 1,
                    first_name: 'John',
                    last_name: 'Doe',
                    department: 'Engineering',
                    position: 'Developer',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: 2,
                    user_id: 2,
                    first_name: 'Jane',
                    last_name: 'Smith',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            mockEmployeeQueries.getEmployees.mockResolvedValue({ data: mockEmployees, total: 2 });

            const result = await employeeService.getEmployees();

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
            expect(result.data[0].first_name).toBe('John');
            expect(mockEmployeeQueries.getEmployees).toHaveBeenCalled();
        });

        it('should return empty array if no employees', async () => {
            mockEmployeeQueries.getEmployees.mockResolvedValue({ data: [], total: 0 });

            const result = await employeeService.getEmployees();

            expect(result.data).toHaveLength(0);
            expect(result.total).toBe(0);
        });

        it('should handle database errors', async () => {
            mockEmployeeQueries.getEmployees.mockRejectedValue(new Error('DB error'));

            await expect(employeeService.getEmployees()).rejects.toThrow('Failed to fetch employees');
        });
    });

    describe('getEmployeeById', () => {
        it('should return employee by id', async () => {
            const mockEmployee = {
                id: 1,
                user_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                created_at: new Date(),
                updated_at: new Date()
            };

            mockEmployeeQueries.getEmployeeById.mockResolvedValue(mockEmployee);

            const result = await employeeService.getEmployeeById(1);

            expect(result.id).toBe(1);
            expect(result.first_name).toBe('John');
            expect(mockEmployeeQueries.getEmployeeById).toHaveBeenCalledWith(1);
        });

        it('should throw error if id is invalid', async () => {
            await expect(employeeService.getEmployeeById(0)).rejects.toThrow('Valid employee ID is required');
            await expect(employeeService.getEmployeeById(-1)).rejects.toThrow('Valid employee ID is required');
        });

        it('should throw error if employee not found', async () => {
            mockEmployeeQueries.getEmployeeById.mockResolvedValue(null);

            await expect(employeeService.getEmployeeById(999)).rejects.toThrow('Employee not found');
        });
    });

    describe('updateEmployee', () => {
        it('should update employee successfully', async () => {
            mockEmployeeQueries.employeeExists.mockResolvedValue(true);
            mockEmployeeQueries.updateEmployee.mockResolvedValue({
                id: 1,
                user_id: 1,
                first_name: 'John',
                last_name: 'Smith',
                department: 'Engineering',
                position: 'Senior Developer',
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await employeeService.updateEmployee(1, {
                last_name: 'Smith',
                position: 'Senior Developer'
            });

            expect(result.last_name).toBe('Smith');
            expect(result.position).toBe('Senior Developer');
            expect(mockEmployeeQueries.updateEmployee).toHaveBeenCalledWith(1, {
                last_name: 'Smith',
                position: 'Senior Developer'
            });
        });

        it('should throw error if id is invalid', async () => {
            await expect(
                employeeService.updateEmployee(0, { first_name: 'John' })
            ).rejects.toThrow('Valid employee ID is required');
        });

        it('should throw error if employee not found', async () => {
            mockEmployeeQueries.employeeExists.mockResolvedValue(false);

            await expect(
                employeeService.updateEmployee(999, { first_name: 'John' })
            ).rejects.toThrow('Employee not found');
        });

        it('should throw error if update fails', async () => {
            mockEmployeeQueries.employeeExists.mockResolvedValue(true);
            mockEmployeeQueries.updateEmployee.mockResolvedValue(null);

            await expect(
                employeeService.updateEmployee(1, { first_name: 'John' })
            ).rejects.toThrow('Failed to update employee');
        });
    });

    describe('deleteEmployee', () => {
        it('should delete employee successfully', async () => {
            mockEmployeeQueries.employeeExists.mockResolvedValue(true);
            mockEmployeeQueries.deleteEmployee.mockResolvedValue(true);

            await employeeService.deleteEmployee(1);

            expect(mockEmployeeQueries.deleteEmployee).toHaveBeenCalledWith(1);
        });

        it('should throw error if id is invalid', async () => {
            await expect(employeeService.deleteEmployee(0)).rejects.toThrow('Valid employee ID is required');
        });

        it('should throw error if employee not found', async () => {
            mockEmployeeQueries.employeeExists.mockResolvedValue(false);

            await expect(employeeService.deleteEmployee(999)).rejects.toThrow('Employee not found');
        });

        it('should throw error if delete fails', async () => {
            mockEmployeeQueries.employeeExists.mockResolvedValue(true);
            mockEmployeeQueries.deleteEmployee.mockResolvedValue(false);

            await expect(employeeService.deleteEmployee(1)).rejects.toThrow('Failed to delete employee');
        });
    });
});
