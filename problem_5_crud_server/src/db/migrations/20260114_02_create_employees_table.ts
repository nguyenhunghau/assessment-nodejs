import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('employees', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().unique();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('department');
        table.string('position');
        table.timestamps(true, true);

        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.index(['department']);
        table.index(['position']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('employees');
}
