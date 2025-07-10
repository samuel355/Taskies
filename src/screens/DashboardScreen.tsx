import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { DashboardStats, Project, Task } from '../types';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { formatTimeAgo, getStatusColor, getPriorityColor } from '../utils';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList & TabParamList>>();
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    tasksInProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
  });

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, tasks]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        fetchProjects(user.id),
        fetchTasks(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateStats = () => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== 'completed'
    ).length;
    const tasksInProgress = tasks.filter(t => t.status === 'in-progress').length;

    // Calculate weekly and monthly progress (simplified)
    const weeklyProgress = Math.round((completedTasks / Math.max(tasks.length, 1)) * 100);
    const monthlyProgress = Math.round((activeProjects / Math.max(projects.length, 1)) * 100);

    setStats({
      totalProjects: projects.length,
      activeProjects,
      totalTasks: tasks.length,
      completedTasks,
      overdueTasks,
      tasksInProgress,
      weeklyProgress,
      monthlyProgress,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, {user?.firstName}!
          </Text>
          <Text style={styles.subtitle}>Here's what's happening today</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate({ name: 'Profile', params: undefined })}
        >
          <Avatar
            src={user?.avatar}
            name={`${user?.firstName} ${user?.lastName}`}
            size="lg"
            showOnlineStatus
            isOnline={true}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <StatCard
        title="Total Projects"
        value={stats.totalProjects}
        subtitle={`${stats.activeProjects} active`}
        color={COLORS.primary}
        onPress={() => navigation.navigate({ name: 'Projects', params: undefined })}
      />
      <StatCard
        title="Tasks"
        value={stats.totalTasks}
        subtitle={`${stats.completedTasks} completed`}
        color={COLORS.success}
        onPress={() => navigation.navigate({ name: 'Tasks', params: undefined })}
      />
      <StatCard
        title="In Progress"
        value={stats.tasksInProgress}
        subtitle={`${stats.overdueTasks} overdue`}
        color={COLORS.warning}
        onPress={() => navigation.navigate({ name: 'Tasks', params: undefined })}
      />
      <StatCard
        title="Weekly Progress"
        value={`${stats.weeklyProgress}%`}
        subtitle="This week"
        color={COLORS.info}
        onPress={() => navigation.navigate({ name: 'Calendar', params: undefined })}
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate({ name: 'CreateProject', params: undefined })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.quickActionIconText}>+</Text>
          </View>
          <Text style={styles.quickActionText}>New Project</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate({ name: 'CreateTask', params: {} })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary }]}>
            <Text style={styles.quickActionIconText}>✓</Text>
          </View>
          <Text style={styles.quickActionText}>New Task</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate({ name: 'TeamMembers', params: { projectId: '' } })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning }]}>
            <Text style={styles.quickActionIconText}>👥</Text>
          </View>
          <Text style={styles.quickActionText}>Team</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate({ name: 'Notifications', params: undefined })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.error }]}>
            <Text style={styles.quickActionIconText}>🔔</Text>
          </View>
          <Text style={styles.quickActionText}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentProjects = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Projects</Text>
        <TouchableOpacity onPress={() => navigation.navigate({ name: 'Projects', params: undefined })}>
          <Text style={styles.sectionLink}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={projects.slice(0, 5)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.projectsList}
        renderItem={({ item }) => <ProjectCard project={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );

  const renderRecentTasks = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Tasks</Text>
        <TouchableOpacity onPress={() => navigation.navigate({ name: 'Tasks', params: undefined })}>
          <Text style={styles.sectionLink}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks.slice(0, 5)}
        renderItem={({ item }) => <TaskCard task={item} />}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsGrid()}
        {renderQuickActions()}
        {renderRecentProjects()}
        {renderRecentTasks()}
      </ScrollView>
    </View>
  );
};

// Helper Components
const StatCard = ({ title, value, subtitle, color, onPress }: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress}>
    <View style={[styles.statCardIcon, { backgroundColor: color }]}>
      <Text style={styles.statCardIconText}>📊</Text>
    </View>
    <View style={styles.statCardContent}>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const ProjectCard = ({ project }: { project: Project }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList & TabParamList>>();

  return (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate({ name: 'ProjectDetails', params: { projectId: project.id } })}
    >
      <View style={[styles.projectCardHeader, { backgroundColor: project.color }]}>
        <Text style={styles.projectCardIcon}>{project.icon}</Text>
      </View>
      <View style={styles.projectCardContent}>
        <Text style={styles.projectCardTitle} numberOfLines={1}>
          {project.name}
        </Text>
        <Text style={styles.projectCardDescription} numberOfLines={2}>
          {project.description}
        </Text>
        <View style={styles.projectCardFooter}>
          <Badge
            label={project.status}
            size="sm"
            customColor={getStatusColor(project.status)}
          />
          <Text style={styles.projectCardProgress}>{project.progress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList & TabParamList>>();

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate({ name: 'TaskDetails', params: { taskId: task.id } })}
    >
      <View style={styles.taskCardContent}>
        <View style={styles.taskCardHeader}>
          <Text style={styles.taskCardTitle} numberOfLines={1}>
            {task.title}
          </Text>
          <Badge
            label={task.priority}
            size="sm"
            customColor={getPriorityColor(task.priority)}
          />
        </View>
        <Text style={styles.taskCardDescription} numberOfLines={2}>
          {task.description}
        </Text>
        <View style={styles.taskCardFooter}>
          <Badge
            label={task.status}
            size="sm"
            customColor={getStatusColor(task.status)}
          />
          {task.dueDate && (
            <Text style={styles.taskCardDueDate}>
              Due {formatTimeAgo(task.dueDate)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper Functions
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  avatarContainer: {
    marginLeft: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  statCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statCardIconText: {
    fontSize: FONT_SIZES.lg,
  },
  statCardContent: {
    alignItems: 'flex-start',
  },
  statCardValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statCardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statCardSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionIconText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  projectsList: {
    paddingHorizontal: SPACING.lg,
  },
  projectCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  projectCardHeader: {
    height: 80,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectCardIcon: {
    fontSize: FONT_SIZES['2xl'],
  },
  projectCardContent: {
    padding: SPACING.md,
  },
  projectCardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  projectCardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectCardProgress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  taskCardContent: {
    padding: SPACING.md,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskCardTitle: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
  },
  taskCardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardDueDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

export default DashboardScreen;
