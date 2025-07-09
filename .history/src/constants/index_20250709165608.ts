// App Constants
export const APP_NAME = 'Taskies';
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';

// API Constants
export const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.taskies.app';
export const SUPABASE_URL = 'https://nmhihrdwweouwyutsrkj.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  OFFLINE_DATA: 'offline_data',
  SETTINGS: 'settings',
  DRAFT_TASKS: 'draft_tasks',
  DRAFT_PROJECTS: 'draft_projects',
} as const;

// Colors
export const COLORS = {
  // Primary Colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#93C5FD',

  // Secondary Colors
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#86EFAC',

  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Task Priority Colors
  priorityLow: '#10B981',
  priorityMedium: '#F59E0B',
  priorityHigh: '#EF4444',
  priorityUrgent: '#DC2626',

  // Task Status Colors
  statusTodo: '#6B7280',
  statusInProgress: '#3B82F6',
  statusReview: '#F59E0B',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',

  // Project Status Colors
  projectActive: '#10B981',
  projectCompleted: '#3B82F6',
  projectOnHold: '#F59E0B',
  projectCancelled: '#EF4444',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background Colors
  background: '#F9FAFB',
  backgroundDark: '#1F2937',
  surface: '#FFFFFF',
  surfaceDark: '#374151',

  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  textPrimaryDark: '#F9FAFB',
  textSecondaryDark: '#D1D5DB',
  textDisabledDark: '#6B7280',

  // Border Colors
  border: '#E5E7EB',
  borderDark: '#4B5563',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// Fonts
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  light: 'Inter-Light',
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// Screen Dimensions
export const SCREEN_PADDING = 16;
export const HEADER_HEIGHT = 60;
export const TAB_BAR_HEIGHT = 80;
export const BOTTOM_SHEET_HEIGHT = 400;

// Task Constants
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: COLORS.priorityLow },
  { value: 'medium', label: 'Medium', color: COLORS.priorityMedium },
  { value: 'high', label: 'High', color: COLORS.priorityHigh },
  { value: 'urgent', label: 'Urgent', color: COLORS.priorityUrgent },
] as const;

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: COLORS.statusTodo },
  { value: 'in-progress', label: 'In Progress', color: COLORS.statusInProgress },
  { value: 'review', label: 'Review', color: COLORS.statusReview },
  { value: 'completed', label: 'Completed', color: COLORS.statusCompleted },
  { value: 'cancelled', label: 'Cancelled', color: COLORS.statusCancelled },
] as const;

// Project Constants
export const PROJECT_PRIORITIES = TASK_PRIORITIES;

export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active', color: COLORS.projectActive },
  { value: 'completed', label: 'Completed', color: COLORS.projectCompleted },
  { value: 'on-hold', label: 'On Hold', color: COLORS.projectOnHold },
  { value: 'cancelled', label: 'Cancelled', color: COLORS.projectCancelled },
] as const;

// Project Icons
export const PROJECT_ICONS = [
  'briefcase',
  'code',
  'design',
  'marketing',
  'finance',
  'research',
  'support',
  'sales',
  'education',
  'health',
  'travel',
  'food',
  'shopping',
  'entertainment',
  'sports',
  'music',
  'photography',
  'writing',
  'gaming',
  'social',
] as const;

// Project Colors
export const PROJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
] as const;

// File Types
export const SUPPORTED_FILE_TYPES = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  spreadsheets: ['xls', 'xlsx', 'csv'],
  presentations: ['ppt', 'pptx'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  audio: ['mp3', 'wav', 'aac', 'm4a'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
} as const;

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 20 * 1024 * 1024, // 20MB
  default: 10 * 1024 * 1024, // 10MB
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_DUE: 'task_due',
  COMMENT_ADDED: 'comment_added',
  MENTION: 'mention',
  PROJECT_UPDATE: 'project_update',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
} as const;

// Project Member Roles
export const PROJECT_MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  api: 'yyyy-MM-dd',
  apiWithTime: 'yyyy-MM-dd HH:mm:ss',
  relative: 'relative',
} as const;

// Pagination
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;

// Validation
export const VALIDATION = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  minUsernameLength: 3,
  maxUsernameLength: 30,
  maxProjectNameLength: 100,
  maxTaskTitleLength: 200,
  maxDescriptionLength: 1000,
  maxCommentLength: 500,
} as const;

// Permissions
export const PERMISSIONS = {
  // Project Permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',

  // Task Permissions
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',

  // Comment Permissions
  COMMENT_CREATE: 'comment:create',
  COMMENT_READ: 'comment:read',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',

  // File Permissions
  FILE_UPLOAD: 'file:upload',
  FILE_DOWNLOAD: 'file:download',
  FILE_DELETE: 'file:delete',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  FILE_TYPE_NOT_SUPPORTED: 'File type is not supported.',
  OFFLINE_ERROR: 'This action requires an internet connection.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  PROJECT_CREATED: 'Project created successfully!',
  PROJECT_UPDATED: 'Project updated successfully!',
  PROJECT_DELETED: 'Project deleted successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,30}$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  url: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  MILLISECONDS_IN_SECOND: 1000,
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30,
  MONTHS_IN_YEAR: 12,
} as const;

// Haptic Feedback Types
export const HAPTIC_FEEDBACK = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Deep Link Prefixes
export const DEEP_LINK_PREFIXES = {
  PROJECT: 'taskies://project/',
  TASK: 'taskies://task/',
  USER: 'taskies://user/',
  NOTIFICATION: 'taskies://notification/',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_VOICE_NOTES: false,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
} as const;
