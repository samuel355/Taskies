import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { formatDate, getProjectStatusColor } from '../utils';

const ProjectsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const { projects, fetchProjects, deleteProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjects = async () => {
    if (!user) return;
    await fetchProjects(user.id);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteProject(projectId);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const getFilteredProjects = () => {
    if (selectedStatus === 'all') return projects;
    return projects.filter(project => project.status === selectedStatus);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Projects</Text>
        <Button
          title="New Project"
          onPress={() => navigation.navigate('CreateProject')}
          size="sm"
          icon={<Text style={styles.buttonIcon}>+</Text>}
        />
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filters}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedStatus === 'all' && styles.filterButtonActive
        ]}
        onPress={() => setSelectedStatus('all')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedStatus === 'all' && styles.filterButtonTextActive
        ]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedStatus === 'active' && styles.filterButtonActive
        ]}
        onPress={() => setSelectedStatus('active')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedStatus === 'active' && styles.filterButtonTextActive
        ]}>
          Active
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedStatus === 'completed' && styles.filterButtonActive
        ]}
        onPress={() => setSelectedStatus('completed')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedStatus === 'completed' && styles.filterButtonTextActive
        ]}>
          Completed
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedStatus === 'on-hold' && styles.filterButtonActive
        ]}
        onPress={() => setSelectedStatus('on-hold')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedStatus === 'on-hold' && styles.filterButtonTextActive
        ]}>
          On Hold
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProjectCard = ({ item }: { item: Project }) => (
    <Card
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
    >
      <View style={styles.projectHeader}>
        <View style={[styles.projectIcon, { backgroundColor: item.color }]}>
          <Text style={styles.projectIconText}>{item.icon}</Text>
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>
            {item.name}
          </Text>
          <Badge
            label={item.status}
            size="sm"
            customColor={getProjectStatusColor(item.status)}
          />
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => handleDeleteProject(item.id)}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.projectProgress}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${item.progress}%`, backgroundColor: item.color }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.projectMembers}>
          {item.members.slice(0, 3).map((member, index) => (
            <Avatar
              key={member.id}
              src={member.user.avatar}
              name={`${member.user.firstName} ${member.user.lastName}`}
              size="xs"
              style={StyleSheet.flatten([
                styles.memberAvatar,
                index > 0 ? { marginLeft: -8 } : {},
              ])}
            />
          ))}
          {item.members.length > 3 && (
            <View style={styles.moreMembers}>
              <Text style={styles.moreMembersText}>+{item.members.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={styles.projectDates}>
          <Text style={styles.projectDate}>
            {item.deadline ? `Due ${formatDate(item.deadline)}` : 'No deadline'}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Projects Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Create your first project to get started with organizing your tasks
      </Text>
      <Button
        title="Create Project"
        onPress={() => navigation.navigate('CreateProject')}
        style={styles.emptyStateButton}
      />
    </View>
  );

  const filteredProjects = getFilteredProjects();

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id}
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
  filters: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
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
  projectCard: {
    marginBottom: SPACING.lg,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  projectIconText: {
    fontSize: FONT_SIZES.lg,
  },
  projectInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  projectName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  menuButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  projectDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  projectProgress: {
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
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  moreMembers: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreMembersText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  projectDates: {
    alignItems: 'flex-end',
  },
  projectDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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

export default ProjectsScreen;
