import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();
        table.enum('role', ['admin', 'employee']).notNullable().defaultTo('employee');
        table.timestamps(true, true);

        table.index(['email']);
        table.index(['role']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users');
}
