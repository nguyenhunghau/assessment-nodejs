import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Add composite indexes for better query performance
    
    // Users table - for authentication and role-based queries
    await knex.schema.alterTable('users', (table) => {
        table.index(['email', 'role'], 'idx_users_email_role');
        table.index(['created_at'], 'idx_users_created_at');
    });

    // Employees table - for searching and filtering
    await knex.schema.alterTable('employees', (table) => {
        table.index(['user_id', 'department'], 'idx_employees_user_dept');
        table.index(['department', 'position'], 'idx_employees_dept_position');
        table.index(['last_name', 'first_name'], 'idx_employees_name');
        table.index(['created_at'], 'idx_employees_created_at');
    });

    // Tasks table - for filtering and sorting
    await knex.schema.alterTable('tasks', (table) => {
        // Composite index for common filter combinations
        table.index(['assigned_to_user_id', 'status'], 'idx_tasks_assigned_status');
        table.index(['assigned_to_user_id', 'priority'], 'idx_tasks_assigned_priority');
        table.index(['status', 'priority'], 'idx_tasks_status_priority');
        table.index(['assigned_to_user_id', 'status', 'priority'], 'idx_tasks_assigned_status_priority');
        
        // Index for due date queries
        table.index(['due_date'], 'idx_tasks_due_date');
        table.index(['assigned_to_user_id', 'due_date'], 'idx_tasks_assigned_due');
        
        // Index for created_at for sorting and pagination
        table.index(['created_at'], 'idx_tasks_created_at');
        
        // Index for finding tasks by creator
        table.index(['created_by_user_id', 'status'], 'idx_tasks_creator_status');
    });
}

export async function down(knex: Knex): Promise<void> {
    // Drop composite indexes in reverse order
    
    await knex.schema.alterTable('tasks', (table) => {
        table.dropIndex([], 'idx_tasks_creator_status');
        table.dropIndex([], 'idx_tasks_created_at');
        table.dropIndex([], 'idx_tasks_assigned_due');
        table.dropIndex([], 'idx_tasks_due_date');
        table.dropIndex([], 'idx_tasks_assigned_status_priority');
        table.dropIndex([], 'idx_tasks_status_priority');
        table.dropIndex([], 'idx_tasks_assigned_priority');
        table.dropIndex([], 'idx_tasks_assigned_status');
    });

    await knex.schema.alterTable('employees', (table) => {
        table.dropIndex([], 'idx_employees_created_at');
        table.dropIndex([], 'idx_employees_name');
        table.dropIndex([], 'idx_employees_dept_position');
        table.dropIndex([], 'idx_employees_user_dept');
    });

    await knex.schema.alterTable('users', (table) => {
        table.dropIndex([], 'idx_users_created_at');
        table.dropIndex([], 'idx_users_email_role');
    });
}
