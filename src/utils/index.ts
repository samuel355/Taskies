import { format, formatDistance, formatRelative, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Dimensions, Platform } from 'react-native';
import { COLORS} from '../constants';

// Device utilities
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Date utilities
export const formatDate = (date: string | Date, formatString: string = 'MMM dd, yyyy') => {
  return format(new Date(date), formatString);
};

export const formatDateRelative = (date: string | Date) => {
  const targetDate = new Date(date);
  const now = new Date();

  if (isToday(targetDate)) {
    return 'Today';
  } else if (isTomorrow(targetDate)) {
    return 'Tomorrow';
  } else if (isYesterday(targetDate)) {
    return 'Yesterday';
  } else {
    return formatRelative(targetDate, now);
  }
};

export const formatTimeAgo = (date: string | Date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const isOverdue = (dueDate: string | Date) => {
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate: string | Date) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// String utilities
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Color utilities
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return COLORS.statusTodo;
    case 'in-progress':
      return COLORS.statusInProgress;
    case 'review':
      return COLORS.statusReview;
    case 'completed':
      return COLORS.statusCompleted;
    case 'cancelled':
      return COLORS.statusCancelled;
    default:
      return COLORS.gray500;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return COLORS.priorityLow;
    case 'medium':
      return COLORS.priorityMedium;
    case 'high':
      return COLORS.priorityHigh;
    case 'urgent':
      return COLORS.priorityUrgent;
    default:
      return COLORS.gray500;
  }
};

export const getProjectStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return COLORS.projectActive;
    case 'completed':
      return COLORS.projectCompleted;
    case 'on-hold':
      return COLORS.projectOnHold;
    case 'cancelled':
      return COLORS.projectCancelled;
    default:
      return COLORS.gray500;
  }
};

export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((result, item) => {
    const group = item[key] as string;
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const removeDuplicates = <T>(array: T[], key: keyof T) => {
  return array.filter((item, index, self) =>
    index === self.findIndex(t => t[key] === item[key])
  );
};

// Validation utilities
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string) => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUrl = (url: string) => {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(url);
};

// File utilities
export const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (filename: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isDocumentFile = (filename: string) => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];
  return documentExtensions.includes(getFileExtension(filename));
};

// Number utilities
export const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculatePercentage = (value: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Progress utilities
export const getProgressColor = (progress: number) => {
  if (progress === 0) return COLORS.gray300;
  if (progress < 25) return COLORS.error;
  if (progress < 50) return COLORS.warning;
  if (progress < 75) return COLORS.info;
  if (progress < 100) return COLORS.primary;
  return COLORS.success;
};

export const getProgressText = (progress: number) => {
  if (progress === 0) return 'Not Started';
  if (progress < 25) return 'Just Started';
  if (progress < 50) return 'In Progress';
  if (progress < 75) return 'Making Progress';
  if (progress < 100) return 'Almost Done';
  return 'Completed';
};

// Theme utilities
export const getThemeColors = (isDark: boolean) => {
  return {
    background: isDark ? COLORS.backgroundDark : COLORS.background,
    surface: isDark ? COLORS.surfaceDark : COLORS.surface,
    text: isDark ? COLORS.textPrimaryDark : COLORS.textPrimary,
    textSecondary: isDark ? COLORS.textSecondaryDark : COLORS.textSecondary,
    border: isDark ? COLORS.borderDark : COLORS.border,
  };
};

// Search utilities
export const highlightSearchTerm = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const fuzzySearch = (items: any[], searchTerm: string, keys: string[]) => {
  if (!searchTerm) return items;

  const lowercaseSearchTerm = searchTerm.toLowerCase();

  return items.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearchTerm);
      }
      if (Array.isArray(value)) {
        return value.some(v =>
          typeof v === 'string' && v.toLowerCase().includes(lowercaseSearchTerm)
        );
      }
      return false;
    });
  });
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

// Local storage utilities
export const storage = {
  set: (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      // This would be implemented with MMKV or AsyncStorage
      console.log(jsonValue)
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },
  get: (key: string) => {
    console.log(key)
    try {
      // This would be implemented with MMKV or AsyncStorage
      const jsonValue = ''; // placeholder
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  remove: (key: string) => {
    console.log(key)
    try {
      // This would be implemented with MMKV or AsyncStorage
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
    return true;
  },
};

// Network utilities
export const isOnline = () => {
  // This would be implemented with NetInfo
  return true;
};

// Permission utilities
export const hasPermission = (userRole: string, requiredPermission: string) => {
  const rolePermissions = {
    admin: ['*'],
    manager: ['project:*', 'task:*', 'comment:*', 'file:*'],
    member: ['project:read', 'task:read', 'task:update', 'comment:*', 'file:read'],
  };

  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];

  return permissions.includes('*') ||
         permissions.includes(requiredPermission) ||
         permissions.some(permission =>
           permission.endsWith(':*') &&
           requiredPermission.startsWith(permission.slice(0, -1))
         );
};

// Animation utilities
export const easeInOut = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const easeIn = (t: number) => {
  return t * t;
};

export const easeOut = (t: number) => {
  return t * (2 - t);
};

// Error utilities
export const getErrorMessage = (error: any) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

export const logError = (error: any, context?: string) => {
  console.error(`[${context || 'ERROR'}]:`, error);
  // Here you would send to crash reporting service like Crashlytics
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// Random utilities
export const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateRandomName = () => {
  const adjectives = ['Amazing', 'Awesome', 'Cool', 'Epic', 'Fantastic', 'Great', 'Incredible', 'Outstanding'];
  const nouns = ['Project', 'Task', 'Goal', 'Mission', 'Adventure', 'Journey', 'Challenge', 'Quest'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};
