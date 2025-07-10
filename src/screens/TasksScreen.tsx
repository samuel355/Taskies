import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../constants';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { Task, TaskFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import {
  formatTimeAgo,
  getStatusColor,
  getPriorityColor,
  isOverdue,
} from '../utils';

const TasksScreen = () => {
  // Use correct navigation type if available, fallback to any
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const {
    fetchTasks,
    updateTaskStatus,
    deleteTask,
    setFilters,
    getFilteredTasks,
  } = useTaskStore();
  const { projects } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'my-tasks' | 'assigned-by-me'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const loadTasks = React.useCallback(async () => {
    if (!user) return;
    await fetchTasks();
  }, [user, fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    // Update filters when search or filter options change
    const newFilters: TaskFilters = {
      search: searchQuery,
    };

    if (selectedStatus !== 'all') {
      newFilters.status = [selectedStatus as Task['status']];
    }

    if (selectedPriority !== 'all') {
      newFilters.priority = [selectedPriority as Task['priority']];
    }

    if (selectedFilter === 'my-tasks' && user) {
      newFilters.assignee = [user.id];
    } else if (selectedFilter === 'assigned-by-me' && user) {
      // This would need a custom filter in the store
      // For now, we'll filter in the component
    }

    setFilters(newFilters);
  }, [
    searchQuery,
    selectedFilter,
    selectedStatus,
    selectedPriority,
    user,
    setFilters,
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskStatusUpdate = async (
    taskId: string,
    newStatus: Task['status'],
  ) => {
    const result = await updateTaskStatus(taskId, newStatus);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to update task status');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteTask(taskId);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete task');
            }
          },
        },
      ],
    );
  };

  const filteredTasks = useMemo(() => {
    let result = getFilteredTasks();

    // Additional filtering for assigned-by-me
    if (selectedFilter === 'assigned-by-me' && user) {
      result = result.filter(task => task.assignedById === user.id);
    }

    return result;
  }, [getFilteredTasks, selectedFilter, user]);

  const taskStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(
      task => task.status === 'completed',
    ).length;
    const inProgress = filteredTasks.filter(
      task => task.status === 'in-progress',
    ).length;
    const overdue = filteredTasks.filter(
      task =>
        task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed',
    ).length;

    return { total, completed, inProgress, overdue };
  }, [filteredTasks]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Tasks</Text>
        <Button
          title="New Task"
          onPress={() => navigation.navigate('CreateTask' as never)}
          size="sm"
          icon={<Text style={styles.buttonIcon}>+</Text>}
        />
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={COLORS.textSecondary}
      />
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{taskStats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: COLORS.statusInProgress }]}>
          {taskStats.inProgress}
        </Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: COLORS.success }]}>
          {taskStats.completed}
        </Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: COLORS.error }]}>
          {taskStats.overdue}
        </Text>
        <Text style={styles.statLabel}>Overdue</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filterSectionTitle}>Filter by:</Text>

      {/* Task Type Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'my-tasks' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('my-tasks')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'my-tasks' && styles.filterButtonTextActive,
            ]}
          >
            My Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'assigned-by-me' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('assigned-by-me')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'assigned-by-me' &&
                styles.filterButtonTextActive,
            ]}
          >
            Assigned by Me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'todo' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('todo')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === 'todo' && styles.filterButtonTextActive,
            ]}
          >
            To Do
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'in-progress' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('in-progress')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === 'in-progress' && styles.filterButtonTextActive,
            ]}
          >
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'completed' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('completed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === 'completed' && styles.filterButtonTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Priority Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPriority === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPriority('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedPriority === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All Priority
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPriority === 'urgent' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPriority('urgent')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedPriority === 'urgent' && styles.filterButtonTextActive,
            ]}
          >
            Urgent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPriority === 'high' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPriority('high')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedPriority === 'high' && styles.filterButtonTextActive,
            ]}
          >
            High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPriority === 'medium' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPriority('medium')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedPriority === 'medium' && styles.filterButtonTextActive,
            ]}
          >
            Medium
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTaskCard = ({ item }: { item: Task }) => {
    const project = projects.find(p => p.id === item.projectId);
    const isTaskOverdue =
      item.dueDate && isOverdue(item.dueDate) && item.status !== 'completed';

    return (
      <Card
        style={([styles.taskCard, isTaskOverdue && styles.overdueCard].filter(Boolean) as any)}
        onPress={() => navigation.navigate('TaskDetails' as never, { taskId: item.id } as never)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.taskBadges}>
              <Badge
                label={item.status.replace('-', ' ')}
                size="sm"
                customColor={getStatusColor(item.status)}
              />
              <Badge
                label={item.priority}
                size="sm"
                customColor={getPriorityColor(item.priority)}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleDeleteTask(item.id)}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {project && (
          <View style={styles.projectInfo}>
            <View
              style={[styles.projectDot, { backgroundColor: project.color }]}
            />
            <Text style={styles.projectName}>{project.name}</Text>
          </View>
        )}

        <View style={styles.taskProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${item.progress}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.taskAssignee}>
            {item.assigneeId && (
              <Avatar name="Assignee" size="xs" style={styles.assigneeAvatar} />
            )}
            <Text style={styles.assigneeText}>
              {item.assigneeId ? 'Assigned' : 'Unassigned'}
            </Text>
          </View>
          <View style={styles.taskDates}>
            {item.dueDate && (
              <Text
                style={[
                  styles.dueDateText,
                  isTaskOverdue && styles.overdueDateText,
                ]}
              >
                {isTaskOverdue
                  ? 'Overdue'
                  : `Due ${formatTimeAgo(item.dueDate)}`}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          {item.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.quickActionButton, styles.completeButton]}
              onPress={() => handleTaskStatusUpdate(item.id, 'completed')}
            >
              <Text style={styles.quickActionText}>✓ Complete</Text>
            </TouchableOpacity>
          )}
          {item.status === 'todo' && (
            <TouchableOpacity
              style={[styles.quickActionButton, styles.startButton]}
              onPress={() => handleTaskStatusUpdate(item.id, 'in-progress')}
            >
              <Text style={styles.quickActionText}>▶ Start</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in-progress' && (
            <TouchableOpacity
              style={[styles.quickActionButton, styles.pauseButton]}
              onPress={() => handleTaskStatusUpdate(item.id, 'todo')}
            >
              <Text style={styles.quickActionText}>⏸ Pause</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>✓</Text>
      <Text style={styles.emptyStateTitle}>No Tasks Found</Text>
      <Text style={styles.emptyStateDescription}>
        {searchQuery
          ? 'No tasks match your search criteria. Try adjusting your filters.'
          : 'Create your first task to get started with your project management.'}
      </Text>
      {!searchQuery && (
        <Button
          title="Create Task"
          onPress={() => navigation.navigate('CreateTask' as never)}
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderStats()}
      {renderFilters()}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  buttonIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  taskCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  overdueCard: {
    borderLeftColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  menuButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  taskDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  projectName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  taskAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    marginRight: SPACING.sm,
  },
  assigneeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  taskDates: {
    alignItems: 'flex-end',
  },
  dueDateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  overdueDateText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickActionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  completeButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyStateButton: {
    paddingHorizontal: SPACING.xl,
  },
});

export default TasksScreen;
