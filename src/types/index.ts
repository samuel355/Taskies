// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: 'admin' | 'manager' | 'member';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  ownerId: string;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  tags: string[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user: User;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  assignedById: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  subtasks: SubTask[];
  dependencies: string[];
  progress: number;
  labels: TaskLabel[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailPath?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  user: User;
  attachments: TaskAttachment[];
  mentions: string[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'task_due' | 'comment_added' | 'mention' | 'project_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    taskId?: string;
    projectId?: string;
    userId?: string;
    [key: string]: any;
  };
}

// File Upload Types
export interface FileUpload {
  id: string;
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface UploadProgress {
  id: string;
  progress: number;
  isUploading: boolean;
  error?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProjectDetails: { projectId: string };
  TaskDetails: { taskId: string };
  CreateProject: undefined;
  CreateTask: { projectId?: string };
  EditTask: { taskId: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  TeamMembers: { projectId: string };
  FileViewer: { fileUrl: string; fileName: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Store Types
export interface AppState {
  auth: AuthState;
  projects: ProjectState;
  tasks: TaskState;
  notifications: NotificationState;
  ui: UIState;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export interface TaskFilters {
  status?: Task['status'][];
  priority?: Task['priority'][];
  assignee?: string[];
  project?: string[];
  dueDate?: {
    from?: string;
    to?: string;
  };
  search?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  isOffline: boolean;
  activeScreen: string;
  modals: {
    createProject: boolean;
    createTask: boolean;
    taskDetails: boolean;
    fileViewer: boolean;
  };
}

// Form Types
export interface CreateProjectForm {
  name: string;
  description: string;
  color: string;
  icon: string;
  deadline?: string;
  priority: Project['priority'];
  budget?: number;
  tags: string[];
  members: string[];
}

export interface CreateTaskForm {
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  priority: Task['priority'];
  dueDate?: string;
  estimatedHours?: number;
  tags: string[];
  labels: string[];
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  type: 'all' | 'projects' | 'tasks' | 'users';
  dateRange?: {
    from: string;
    to: string;
  };
  status?: string[];
  priority?: string[];
}

export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'user';
  title: string;
  description: string;
  avatar?: string;
  metadata?: {
    status?: string;
    priority?: string;
    dueDate?: string;
    projectName?: string;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksInProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'project_created' | 'comment_added';
  title: string;
  description: string;
  user: User;
  timestamp: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    projectName?: string;
    taskTitle?: string;
  };
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'task' | 'project' | 'meeting';
  color: string;
  description?: string;
  location?: string;
  attendees?: User[];
  metadata?: {
    taskId?: string;
    projectId?: string;
    status?: string;
    priority?: string;
  };
}

// Settings Types
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    push: boolean;
    email: boolean;
    taskAssigned: boolean;
    taskDue: boolean;
    projectUpdates: boolean;
    mentions: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showStatus: boolean;
  };
  preferences: {
    defaultView: 'list' | 'board' | 'calendar';
    autoAssignTasks: boolean;
    showCompletedTasks: boolean;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility Types
export type ID = string;
export type Timestamp = string;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
