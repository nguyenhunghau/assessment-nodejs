import Knex from 'knex';
import knexConfig from './knexFile';

const knex = Knex(knexConfig);

export default knex;