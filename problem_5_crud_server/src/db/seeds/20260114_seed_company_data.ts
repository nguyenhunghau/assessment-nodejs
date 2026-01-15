import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear in FK-safe order
  await knex('tasks').del();
  await knex('employees').del();
  await knex('users').del();

  const adminPassword = await bcrypt.hash('AdminPassword123', 10);
  const employeePassword = await bcrypt.hash('EmployeePassword123', 10);

  const [adminUser] = await knex('users')
    .insert({
      email: 'admin@company.com',
      password_hash: adminPassword,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning(['id', 'email', 'role']);

  const [employeeUser] = await knex('users')
    .insert({
      email: 'employee@company.com',
      password_hash: employeePassword,
      role: 'employee',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning(['id', 'email', 'role']);

  await knex('employees').insert([
    {
      user_id: adminUser.id,
      first_name: 'Admin',
      last_name: 'User',
      department: 'Management',
      position: 'Administrator',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: employeeUser.id,
      first_name: 'Employee',
      last_name: 'User',
      department: 'Operations',
      position: 'Staff',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  await knex('tasks').insert([
    {
      title: 'Complete onboarding',
      description: 'Read company policies and complete access setup.',
      status: 'todo',
      priority: 'high',
      due_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      assigned_to_user_id: employeeUser.id,
      created_by_user_id: adminUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      title: 'Review monthly report',
      description: 'Check KPIs and send notes to leadership.',
      status: 'in_progress',
      priority: 'medium',
      due_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      assigned_to_user_id: adminUser.id,
      created_by_user_id: adminUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
