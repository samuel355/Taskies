import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { supabase } from '../services/supabase';
import { Project, ProjectState, ProjectMember } from '../types';
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

interface ProjectStore extends ProjectState {
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'members'>) => Promise<{ success: boolean; error?: string; data?: Project }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ success: boolean; error?: string; data?: Project }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchProjects: (userId: string) => Promise<{ success: boolean; error?: string; data?: Project[] }>;
  fetchProjectById: (id: string) => Promise<{ success: boolean; error?: string; data?: Project }>;
  addProjectMember: (projectId: string, userId: string, role: 'owner' | 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  removeProjectMember: (projectId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  updateProjectMemberRole: (projectId: string, userId: string, role: 'owner' | 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProject: (project: Project) => void;
  updateProjectInList: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  clearProjects: () => void;
  getProjectById: (id: string) => Project | undefined;
  getUserProjects: (userId: string) => Project[];
  getProjectsByStatus: (status: Project['status']) => Project[];
  getProjectsByPriority: (priority: Project['priority']) => Project[];
  searchProjects: (query: string) => Project[];
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      createProject: async (projectData) => {
        set({ isLoading: true, error: null });
        try {
          const insertData = {
            ...projectData,
            owner_id: (projectData as any).ownerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deadline: projectData.deadline ?? undefined,
            budget: projectData.budget ?? undefined,
          };
          delete (insertData as any).ownerId;
          const { data, error } = await supabase
            .from('projects')
            .insert([insertData])
            .select()
            .single();

          if (error || !data) {
            set({ isLoading: false, error: error?.message || 'Failed to create project' });
            return { success: false, error: error?.message || 'Failed to create project' };
          }

          const project: Project = {
            id: data.id,
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon,
            ownerId: data.owner_id,
            members: [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            deadline: data.deadline ?? undefined,
            status: data.status,
            progress: data.progress,
            priority: data.priority,
            budget: data.budget ?? undefined,
            tags: data.tags,
          };

          set((state) => ({
            projects: [...state.projects, project],
            isLoading: false,
          }));

          return { success: true, data: project };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      updateProject: async (id: string, updates: Partial<Project>) => {
        set({ isLoading: true, error: null });
        try {
          const updateData = {
            ...updates,
            owner_id: (updates as any).ownerId,
            updated_at: new Date().toISOString(),
            deadline: updates.deadline ?? undefined,
            budget: updates.budget ?? undefined,
          };
          delete (updateData as any).ownerId;
          const { data, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

          if (error || !data) {
            set({ isLoading: false, error: error?.message || 'Failed to update project' });
            return { success: false, error: error?.message || 'Failed to update project' };
          }

          const project: Project = {
            id: data.id,
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon,
            ownerId: data.owner_id,
            members: [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            deadline: data.deadline ?? undefined,
            status: data.status,
            progress: data.progress,
            priority: data.priority,
            budget: data.budget ?? undefined,
            tags: data.tags,
          };

          set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? project : p)),
            currentProject: state.currentProject?.id === id ? project : state.currentProject,
            isLoading: false,
          }));

          return { success: true, data: project };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.from('projects').delete().eq('id', id);
          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            isLoading: false,
          }));
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      fetchProjects: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .or(`owner_id.eq.${userId}`);

          if (error || !data) {
            set({ isLoading: false, error: error?.message || 'Failed to fetch projects' });
            return { success: false, error: error?.message || 'Failed to fetch projects' };
          }

          const projects: Project[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            color: item.color,
            icon: item.icon,
            ownerId: item.owner_id,
            members: [],
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            deadline: item.deadline ?? undefined,
            status: item.status,
            progress: item.progress,
            priority: item.priority,
            budget: item.budget ?? undefined,
            tags: item.tags,
          }));

          set({ projects, isLoading: false });
          return { success: true, data: projects };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      fetchProjectById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

          if (error || !data) {
            set({ isLoading: false, error: error?.message || 'Project not found' });
            return { success: false, error: error?.message || 'Project not found' };
          }

          // Fetch members
          const { data: membersData } = await supabase
            .from('project_members')
            .select('*, users(*)')
            .eq('project_id', id);

          const members: ProjectMember[] = (membersData || []).map((member: any) => ({
            id: member.id,
            userId: member.user_id,
            projectId: member.project_id,
            role: member.role,
            joinedAt: member.joined_at,
            user: {
              id: member.users.id,
              email: member.users.email,
              firstName: member.users.first_name,
              lastName: member.users.last_name,
              avatar: member.users.avatar,
              createdAt: member.users.created_at,
              updatedAt: member.users.updated_at,
              isActive: member.users.is_active,
              role: member.users.role,
            },
          }));

          const project: Project = {
            id: data.id,
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon,
            ownerId: data.owner_id,
            members,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            deadline: data.deadline ?? undefined,
            status: data.status,
            progress: data.progress,
            priority: data.priority,
            budget: data.budget ?? undefined,
            tags: data.tags,
          };

          set({ currentProject: project, isLoading: false });
          return { success: true, data: project };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      addProjectMember: async (projectId: string, userId: string, role: 'owner' | 'admin' | 'member') => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_members')
            .insert([{ project_id: projectId, user_id: userId, role }]);
          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      removeProjectMember: async (projectId: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);
          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      updateProjectMemberRole: async (projectId: string, userId: string, role: 'owner' | 'admin' | 'member') => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_members')
            .update({ role })
            .eq('project_id', projectId)
            .eq('user_id', userId);
          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An unexpected error occurred' });
          return { success: false, error: error.message || 'An unexpected error occurred' };
        }
      },

      setProjects: (projects: Project[]) => set({ projects }),
      setCurrentProject: (project: Project | null) => set({ currentProject: project }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      addProject: (project: Project) => {
        set((state) => ({
          projects: [...state.projects, project],
        }));
      },
      updateProjectInList: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...updates } : state.currentProject,
        }));
      },
      removeProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },
      clearProjects: () => set({ projects: [], currentProject: null }),
      getProjectById: (id: string) => get().projects.find((p) => p.id === id),
      getUserProjects: (userId: string) => get().projects.filter((p) => p.ownerId === userId || p.members.some((m) => m.userId === userId)),
      getProjectsByStatus: (status: Project['status']) => get().projects.filter((p) => p.status === status),
      getProjectsByPriority: (priority: Project['priority']) => get().projects.filter((p) => p.priority === priority),
      searchProjects: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().projects.filter((p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },
    }),
    {
      name: STORAGE_KEYS.OFFLINE_DATA,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
);

export default useProjectStore;
