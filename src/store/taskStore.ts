import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { db } from '../services/supabase';
import { Task, TaskState, TaskFilters } from '../types';
import { STORAGE_KEYS } from '../constants';

// Initialize MMKV storage
const storage = new MMKV();

// Custom storage adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

interface TaskStore extends TaskState {
  // Actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'subtasks' | 'labels'>) => Promise<{ success: boolean; error?: string; data?: Task }>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ success: boolean; error?: string; data?: Task }>;
  deleteTask: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchTasks: (projectId?: string, assigneeId?: string) => Promise<{ success: boolean; error?: string; data?: Task[] }>;
  fetchTaskById: (id: string) => Promise<{ success: boolean; error?: string; data?: Task }>;
  fetchTasksByStatus: (status: Task['status'], projectId?: string) => Promise<{ success: boolean; error?: string; data?: Task[] }>;
  fetchOverdueTasks: (userId?: string) => Promise<{ success: boolean; error?: string; data?: Task[] }>;
  assignTask: (taskId: string, assigneeId: string) => Promise<{ success: boolean; error?: string }>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<{ success: boolean; error?: string }>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<{ success: boolean; error?: string }>;
  addComment: (taskId: string, content: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  updateComment: (commentId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  deleteComment: (commentId: string) => Promise<{ success: boolean; error?: string }>;
  addAttachment: (taskId: string, attachment: any) => Promise<{ success: boolean; error?: string }>;
  deleteAttachment: (attachmentId: string) => Promise<{ success: boolean; error?: string }>;
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: TaskFilters) => void;
  addTask: (task: Task) => void;
  updateTaskInList: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  clearTasks: () => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  searchTasks: (query: string) => Task[];
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      currentTask: null,
      isLoading: false,
      error: null,
      filters: {},

      // Actions
      createTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.tasks.create({
            ...taskData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            progress: 0,
            status: 'todo',
            tags: taskData.tags || [],
            dependencies: taskData.dependencies || [],
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data) {
            const task: Task = {
              id: data.id,
              title: data.title,
              description: data.description,
              projectId: data.project_id,
              assigneeId: data.assignee_id,
              assignedById: data.assigned_by_id,
              status: data.status,
              priority: data.priority,
              dueDate: data.due_date,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              completedAt: data.completed_at,
              estimatedHours: data.estimated_hours,
              actualHours: data.actual_hours,
              progress: data.progress,
              tags: data.tags,
              dependencies: data.dependencies,
              attachments: [],
              comments: [],
              subtasks: [],
              labels: [],
            };

            set((state) => ({
              tasks: [...state.tasks, task],
              isLoading: false,
            }));

            return { success: true, data: task };
          }

          set({ isLoading: false, error: 'Failed to create task' });
          return { success: false, error: 'Failed to create task' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.tasks.update(id, {
            ...updates,
            updated_at: new Date().toISOString(),
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data) {
            const task: Task = {
              id: data.id,
              title: data.title,
              description: data.description,
              projectId: data.project_id,
              assigneeId: data.assignee_id,
              assignedById: data.assigned_by_id,
              status: data.status,
              priority: data.priority,
              dueDate: data.due_date,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              completedAt: data.completed_at,
              estimatedHours: data.estimated_hours,
              actualHours: data.actual_hours,
              progress: data.progress,
              tags: data.tags,
              dependencies: data.dependencies,
              attachments: [],
              comments: [],
              subtasks: [],
              labels: [],
            };

            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? task : t)),
              currentTask: state.currentTask?.id === id ? task : state.currentTask,
              isLoading: false,
            }));

            return { success: true, data: task };
          }

          set({ isLoading: false, error: 'Failed to update task' });
          return { success: false, error: 'Failed to update task' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await db.tasks.delete(id);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            currentTask: state.currentTask?.id === id ? null : state.currentTask,
            isLoading: false,
          }));

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchTasks: async (projectId, assigneeId) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.tasks.getAll(projectId, assigneeId);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data) {
            const tasks: Task[] = data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              projectId: item.project_id,
              assigneeId: item.assignee_id,
              assignedById: item.assigned_by_id,
              status: item.status,
              priority: item.priority,
              dueDate: item.due_date,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              completedAt: item.completed_at,
              estimatedHours: item.estimated_hours,
              actualHours: item.actual_hours,
              progress: item.progress,
              tags: item.tags,
              dependencies: item.dependencies,
              attachments: [],
              comments: [],
              subtasks: [],
              labels: [],
            }));

            set({ tasks, isLoading: false });
            return { success: true, data: tasks };
          }

          set({ isLoading: false, error: 'Failed to fetch tasks' });
          return { success: false, error: 'Failed to fetch tasks' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchTaskById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.tasks.getById(id);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data) {
            const task: Task = {
              id: data.id,
              title: data.title,
              description: data.description,
              projectId: data.project_id,
              assigneeId: data.assignee_id,
              assignedById: data.assigned_by_id,
              status: data.status,
              priority: data.priority,
              dueDate: data.due_date,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              completedAt: data.completed_at,
              estimatedHours: data.estimated_hours,
              actualHours: data.actual_hours,
              progress: data.progress,
              tags: data.tags,
              dependencies: data.dependencies,
              attachments: [],
              comments: data.task_comments?.map((comment) => ({
                id: comment.id,
                taskId: data.id,
                userId: comment.user_id,
                content: comment.content,
                createdAt: comment.created_at,
                updatedAt: comment.updated_at,
                editedAt: comment.edited_at,
                user: {
                  id: comment.user.id,
                  firstName: comment.user.first_name,
                  lastName: comment.user.last_name,
                  email: comment.user.email,
                  avatar: comment.user.avatar,
                  createdAt: comment.user.created_at,
                  updatedAt: comment.user.updated_at,
                  isActive: comment.user.is_active,
                  role: comment.user.role,
                },
                attachments: [],
                mentions: comment.mentions || [],
              })) || [],
              subtasks: [],
              labels: [],
            };

            set({ currentTask: task, isLoading: false });
            return { success: true, data: task };
          }

          set({ isLoading: false, error: 'Task not found' });
          return { success: false, error: 'Task not found' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchTasksByStatus: async (status, projectId) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.tasks.getByStatus(status, projectId);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data) {
            const tasks: Task[] = data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              projectId: item.project_id,
              assigneeId: item.assignee_id,
              assignedById: item.assigned_by_id,
              status: item.status,
              priority: item.priority,
              dueDate: item.due_date,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              completedAt: item.completed_at,
              estimatedHours: item.estimated_hours,
              actualHours: item.actual_hours,
              progress: item.progress,
              tags: item.tags,
              dependencies: item.dependencies,
              attachments: [],
              comments: [],
              subtasks: [],
              labels: [],
            }));

            set({ isLoading: false });
            return { success: true, data: tasks };
          }

          set({ isLoading: false, error: 'Failed to fetch tasks' });
          return { success: false, error: 'Failed to fetch tasks' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchOverdueTasks: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.tasks.getOverdue(userId);

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data) {
            const tasks: Task[] = data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              projectId: item.project_id,
              assigneeId: item.assignee_id,
              assignedById: item.assigned_by_id,
              status: item.status,
              priority: item.priority,
              dueDate: item.due_date,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              completedAt: item.completed_at,
              estimatedHours: item.estimated_hours,
              actualHours: item.actual_hours,
              progress: item.progress,
              tags: item.tags,
              dependencies: item.dependencies,
              attachments: [],
              comments: [],
              subtasks: [],
              labels: [],
            }));

            set({ isLoading: false });
            return { success: true, data: tasks };
          }

          set({ isLoading: false, error: 'Failed to fetch overdue tasks' });
          return { success: false, error: 'Failed to fetch overdue tasks' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      assignTask: async (taskId, assigneeId) => {
        return await get().updateTask(taskId, { assigneeId });
      },

      updateTaskStatus: async (taskId, status) => {
        const updates: Partial<Task> = { status };
        if (status === 'completed') {
          updates.completedAt = new Date().toISOString();
          updates.progress = 100;
        }
        return await get().updateTask(taskId, updates);
      },

      updateTaskProgress: async (taskId, progress) => {
        const updates: Partial<Task> = { progress };
        if (progress === 100) {
          updates.status = 'completed';
          updates.completedAt = new Date().toISOString();
        }
        return await get().updateTask(taskId, updates);
      },

      addComment: async (taskId, content, userId) => {
        try {
          const { data, error } = await db.comments.create({
            task_id: taskId,
            user_id: userId,
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          return { success: false, error: errorMessage };
        }
      },

      updateComment: async (commentId, content) => {
        try {
          const { data, error } = await db.comments.update(commentId, content);

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          return { success: false, error: errorMessage };
        }
      },

      deleteComment: async (commentId) => {
        try {
          const { error } = await db.comments.delete(commentId);

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          return { success: false, error: errorMessage };
        }
      },

      addAttachment: async (taskId, attachment) => {
        try {
          const { data, error } = await db.attachments.create({
            task_id: taskId,
            ...attachment,
            uploaded_at: new Date().toISOString(),
          });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          return { success: false, error: errorMessage };
        }
      },

      deleteAttachment: async (attachmentId) => {
        try {
          const { error } = await db.attachments.delete(attachmentId);

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          return { success: false, error: errorMessage };
        }
      },

      setTasks: (tasks) => set({ tasks }),

      setCurrentTask: (task) => set({ currentTask: task }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setFilters: (filters) => set({ filters }),

      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },

      updateTaskInList: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          currentTask: state.currentTask?.id === id ? { ...state.currentTask, ...updates } : state.currentTask,
        }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          currentTask: state.currentTask?.id === id ? null : state.currentTask,
        }));
      },

      clearTasks: () => set({ tasks: [], currentTask: null }),

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },

      getTasksByAssignee: (assigneeId) => {
        return get().tasks.filter((t) => t.assigneeId === assigneeId);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((t) => t.status === status);
      },

      getTasksByPriority: (priority) => {
        return get().tasks.filter((t) => t.priority === priority);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter((t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== 'completed' &&
          t.status !== 'cancelled'
        );
      },

      getTodayTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().tasks.filter((t) =>
          t.dueDate &&
          new Date(t.dueDate) >= today &&
          new Date(t.dueDate) < tomorrow
        );
      },

      getUpcomingTasks: () => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return get().tasks.filter((t) =>
          t.dueDate &&
          new Date(t.dueDate) >= today &&
          new Date(t.dueDate) <= nextWeek &&
          t.status !== 'completed' &&
          t.status !== 'cancelled'
        );
      },

      searchTasks: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().tasks.filter((t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.description.toLowerCase().includes(lowerQuery) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        let filteredTasks = tasks;

        if (filters.status && filters.status.length > 0) {
          filteredTasks = filteredTasks.filter((t) => filters.status!.includes(t.status));
        }

        if (filters.priority && filters.priority.length > 0) {
          filteredTasks = filteredTasks.filter((t) => filters.priority!.includes(t.priority));
        }

        if (filters.assignee && filters.assignee.length > 0) {
          filteredTasks = filteredTasks.filter((t) =>
            t.assigneeId && filters.assignee!.includes(t.assigneeId)
          );
        }

        if (filters.project && filters.project.length > 0) {
          filteredTasks = filteredTasks.filter((t) => filters.project!.includes(t.projectId));
        }

        if (filters.search) {
          const lowerQuery = filters.search.toLowerCase();
          filteredTasks = filteredTasks.filter((t) =>
            t.title.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
          );
        }

        if (filters.dueDate) {
          if (filters.dueDate.from) {
            filteredTasks = filteredTasks.filter((t) =>
              !t.dueDate || new Date(t.dueDate) >= new Date(filters.dueDate!.from!)
            );
          }
          if (filters.dueDate.to) {
            filteredTasks = filteredTasks.filter((t) =>
              !t.dueDate || new Date(t.dueDate) <= new Date(filters.dueDate!.to!)
            );
          }
        }

        return filteredTasks;
      },
    }),
    {
      name: STORAGE_KEYS.DRAFT_TASKS,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        currentTask: state.currentTask,
        filters: state.filters,
      }),
    }
  )
);

export default useTaskStore;
