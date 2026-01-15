import database from '../db/database';
import { User } from '../types';

export const userQueries = {
  createUser: async (data: { email: string; password_hash: string; role: User['role'] }): Promise<User> => {
    const [created] = await database('users')
      .insert({
        email: data.email,
        password_hash: data.password_hash,
        role: data.role,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning(['id', 'email', 'role', 'created_at', 'updated_at']);
    return created;
  },

  getUserByEmailWithPassword: async (email: string): Promise<Pick<User, 'id' | 'email' | 'password_hash' | 'role'> | null> => {
    const row = await database('users')
      .select(['id', 'email', 'password_hash', 'role'])
      .where({ email })
      .first();
    return row || null;
  },

  getUserById: async (id: number): Promise<Pick<User, 'id' | 'email' | 'role'> | null> => {
    const row = await database('users')
      .select(['id', 'email', 'role'])
      .where({ id })
      .first();
    return row || null;
  },

  userExistsByEmail: async (email: string): Promise<boolean> => {
    const row = await database('users').where({ email }).first();
    return !!row;
  },

  userExistsById: async (id: number): Promise<boolean> => {
    const row = await database('users').where({ id }).first();
    return !!row;
  }
};
