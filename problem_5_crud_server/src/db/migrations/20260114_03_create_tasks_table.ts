import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table
      .enum('status', ['todo', 'in_progress', 'done'])
      .notNullable()
      .defaultTo('todo');
    table
      .enum('priority', ['low', 'medium', 'high'])
      .notNullable()
      .defaultTo('medium');
    table.date('due_date');
    table.integer('assigned_to_user_id').unsigned().notNullable();
    table.integer('created_by_user_id').unsigned().notNullable();
    table.timestamps(true, true);

    table
      .foreign('assigned_to_user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .foreign('created_by_user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.index(['status']);
    table.index(['priority']);
    table.index(['assigned_to_user_id']);
    table.index(['created_by_user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tasks');
}
