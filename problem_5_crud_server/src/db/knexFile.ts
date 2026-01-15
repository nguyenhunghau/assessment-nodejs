import { Knex } from 'knex';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root (go up 2 directories from src/db)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '5432'),
    },
    migrations: {
            directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
                directory: path.join(__dirname, 'seeds'),
    },
};

export default config;