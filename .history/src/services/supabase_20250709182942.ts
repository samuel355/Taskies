import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { Database } from '../types/database';

// Create Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'taskies://reset-password',
    });
    return { data, error };
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  // Users
  users: {
    create: async (user: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      return { data, error };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    search: async (query: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);
      return { data, error };
    },
  },

  // Projects
  projects: {
    create: async (project: any) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      return { data, error };
    },

    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner (
            role,
            user_id
          )
        `)
        .eq('project_members.user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            id,
            role,
            joined_at,
            users (
              id,
              first_name,
              last_name,
              email,
              avatar
            )
          )
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      return { error };
    },

    addMember: async (projectId: string, userId: string, role: string) => {
      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
        })
        .select()
        .single();
      return { data, error };
    },

    removeMember: async (projectId: string, userId: string) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);
      return { error };
    },

    updateMemberRole: async (projectId: string, userId: string, role: string) => {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Tasks
  tasks: {
    create: async (task: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      return { data, error };
    },

    getAll: async (projectId?: string, assigneeId?: string) => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!assignee_id (
            id,
            first_name,
            last_name,
            email,
            avatar
          ),
          assigned_by:users!assigned_by_id (
            id,
            first_name,
            last_name,
            email,
            avatar
          ),
          project:projects (
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (assigneeId) {
        query = query.eq('assignee_id', assigneeId);
      }

      const { data, error } = await query;
      return { data, error };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!assignee_id (
            id,
            first_name,
            last_name,
            email,
            avatar
          ),
          assigned_by:users!assigned_by_id (
            id,
            first_name,
            last_name,
            email,
            avatar
          ),
          project:projects (
            id,
            name,
            color
          ),
          task_comments (
            id,
            content,
            created_at,
            updated_at,
            user:users (
              id,
              first_name,
              last_name,
              avatar
            )
          )
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      return { error };
    },

    getByStatus: async (status: string, projectId?: string) => {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('status', status);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      return { data, error };
    },

    getOverdue: async (userId?: string) => {
      let query = supabase
        .from('tasks')
        .select('*')
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed')
        .neq('status', 'cancelled');

      if (userId) {
        query = query.eq('assignee_id', userId);
      }

      const { data, error } = await query;
      return { data, error };
    },
  },

  // Comments
  comments: {
    create: async (comment: any) => {
      const { data, error } = await supabase
        .from('task_comments')
        .insert(comment)
        .select(`
          *,
          user:users (
            id,
            first_name,
            last_name,
            avatar
          )
        `)
        .single();
      return { data, error };
    },

    getByTaskId: async (taskId: string) => {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:users (
            id,
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      return { data, error };
    },

    update: async (id: string, content: string) => {
      const { data, error } = await supabase
        .from('task_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Notifications
  notifications: {
    create: async (notification: any) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      return { data, error };
    },

    getByUserId: async (userId: string, limit: number = 50) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    },

    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    markAllAsRead: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      return { error };
    },

    getUnreadCount: async (userId: string) => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      return { count, error };
    },
  },

  // File attachments
  attachments: {
    create: async (attachment: any) => {
      const { data, error } = await supabase
        .from('task_attachments')
        .insert(attachment)
        .select()
        .single();
      return { data, error };
    },

    getByTaskId: async (taskId: string) => {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: false });
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', id);
      return { error };
    },
  },
};

// Storage helpers
export const storage = {
  upload: async (bucket: string, path: string, file: any) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    return { data, error };
  },

  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data;
  },

  delete: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    return { data, error };
  },

  list: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    return { data, error };
  },
};

// Realtime helpers
export const realtime = {
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },

  subscribeToProject: (projectId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=in.(SELECT id FROM tasks WHERE project_id = '${projectId}')` },
        callback
      )
      .subscribe();
  },

  subscribeToTask: (taskId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`task:${taskId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` },
        callback
      )
      .subscribe();
  },

  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe();
  },

  unsubscribe: (channel: any) => {
    return supabase.removeChannel(channel);
  },
};

export default supabase;
