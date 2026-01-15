import database from '../db/database';
import { Task, TaskStatus } from '../types';

export interface TaskFilters {
    status?: TaskStatus;
    assignedToUserId?: number;
    createdByUserId?: number;
    limit?: number;
    offset?: number;
}

export const taskQueries = {
    createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
        const [created] = await database('tasks')
            .insert({
                ...task,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');
        return created;
    },

    getTasks: async (filters: TaskFilters = {}): Promise<{ data: Task[]; total: number }> => {
        let query = database('tasks');

        if (filters.status) {
            query = query.where('status', filters.status);
        }

        if (filters.assignedToUserId) {
            query = query.where('assigned_to_user_id', filters.assignedToUserId);
        }

        if (filters.createdByUserId) {
            query = query.where('created_by_user_id', filters.createdByUserId);
        }

        const totalResult = await query.clone().count('* as count').first();
        const total = parseInt(totalResult?.count as string) || 0;

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        if (filters.offset) {
            query = query.offset(filters.offset);
        }

        query = query.orderBy('created_at', 'desc');

        const data = await query;
        return { data, total };
    },

    getTaskById: async (id: number): Promise<Task | null> => {
        const row = await database('tasks').where({ id }).first();
        return row || null;
    },

    updateTask: async (id: number, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task | null> => {
        const [updated] = await database('tasks')
            .where({ id })
            .update({
                ...updates,
                updated_at: new Date()
            })
            .returning('*');
        return updated || null;
    },

    deleteTask: async (id: number): Promise<boolean> => {
        const deleted = await database('tasks').where({ id }).del();
        return deleted > 0;
    },

    taskExists: async (id: number): Promise<boolean> => {
        const row = await database('tasks').where({ id }).first();
        return !!row;
    }
};
