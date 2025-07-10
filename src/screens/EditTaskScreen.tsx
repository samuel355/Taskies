import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { Task, User, CreateTaskForm, Project, TaskLabel, RootStackParamList } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const EditTaskScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EditTask'>>();
  const { updateTask, isLoading, getTaskById } = useTaskStore();
  const { projects } = useProjectStore();

  const taskId = route.params?.taskId;
  const initialTask = taskId ? getTaskById(taskId) : null;

  const [formData, setFormData] = useState<CreateTaskForm>({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    projectId: initialTask?.projectId || '',
    assigneeId: initialTask?.assigneeId || '',
    priority: initialTask?.priority || 'medium',
    dueDate: initialTask?.dueDate || '',
    estimatedHours: initialTask?.estimatedHours || 0,
    tags: initialTask?.tags || [],
    labels: initialTask?.labels?.map((l: TaskLabel) => l.id) || [],
  });

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    priority: '',
    dueDate: '',
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (initialTask && initialTask.projectId) {
      const project = projects.find((p: Project) => p.id === initialTask.projectId);
      if (project) setSelectedProject(project);
    }
  }, [initialTask, projects]);

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      projectId: '',
      assigneeId: '',
      priority: '',
      dueDate: '',
    };
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    else if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    else if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    if (!formData.description.trim()) newErrors.description = 'Task description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    else if (formData.description.length > 1000) newErrors.description = 'Description must be less than 1000 characters';
    if (!formData.projectId) newErrors.projectId = 'Please select a project';
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) newErrors.dueDate = 'Due date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async () => {
    if (!validateForm() || !taskId) return;
    try {
      const updatedTask: Partial<Task> = {
        ...formData,
        dueDate: formData.dueDate || undefined,
        estimatedHours: formData.estimatedHours || undefined,
        labels: formData.labels.map(id => ({ id, name: '', color: '' })), // minimal TaskLabel[]
      };
      const result = await updateTask(taskId, updatedTask);
      if (result.success) {
        Alert.alert('Success', 'Task updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update task');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleInputChange = (field: keyof CreateTaskForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setFormData(prev => ({ ...prev, projectId: project.id }));
    setShowProjectPicker(false);
  };

  const selectAssignee = (assignee: User) => {
    setFormData(prev => ({ ...prev, assigneeId: assignee.id }));
    setShowAssigneePicker(false);
  };

  const selectPriority = (priority: CreateTaskForm['priority']) => {
    setFormData(prev => ({ ...prev, priority }));
    setShowPriorityPicker(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButton}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Edit Task</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderProjectPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Project *</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowProjectPicker(!showProjectPicker)}
      >
        {selectedProject ? (
          <View style={styles.selectedItem}>
            <View style={[styles.projectDot, { backgroundColor: selectedProject.color }]} />
            <Text style={styles.selectedItemText}>{selectedProject.name}</Text>
          </View>
        ) : (
          <Text style={styles.pickerPlaceholder}>Select a project</Text>
        )}
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
      {errors.projectId ? <Text style={styles.errorText}>{errors.projectId}</Text> : null}
      {showProjectPicker && (
        <View style={styles.pickerList}>
          {projects.map((project: Project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.pickerItem}
              onPress={() => selectProject(project)}
            >
              <View style={[styles.projectDot, { backgroundColor: project.color }]} />
              <View style={styles.pickerItemContent}>
                <Text style={styles.pickerItemTitle}>{project.name}</Text>
                <Text style={styles.pickerItemSubtitle}>{project.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderAssigneePicker = () => {
    if (!selectedProject) return null;
    const availableAssignees: User[] = selectedProject.members
      .filter((member: any) => member.user.isActive)
      .map((member: any) => member.user);
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assignee</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowAssigneePicker(!showAssigneePicker)}
        >
          {formData.assigneeId ? (
            <View style={styles.selectedItem}>
              <Avatar
                name={`${availableAssignees.find((a: User) => a.id === formData.assigneeId)?.firstName || ''} ${availableAssignees.find((a: User) => a.id === formData.assigneeId)?.lastName || ''}`}
                size="xs"
              />
              <Text style={styles.selectedItemText}>
                {availableAssignees.find((a: User) => a.id === formData.assigneeId)?.firstName || ''} {availableAssignees.find((a: User) => a.id === formData.assigneeId)?.lastName || ''}
              </Text>
            </View>
          ) : (
            <Text style={styles.pickerPlaceholder}>Select an assignee (optional)</Text>
          )}
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {showAssigneePicker && (
          <View style={styles.pickerList}>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setFormData(prev => ({ ...prev, assigneeId: '' }));
                setShowAssigneePicker(false);
              }}
            >
              <Text style={styles.pickerItemTitle}>Unassigned</Text>
            </TouchableOpacity>
            {availableAssignees.map((assignee: User) => (
              <TouchableOpacity
                key={assignee.id}
                style={styles.pickerItem}
                onPress={() => selectAssignee(assignee)}
              >
                <Avatar
                  src={assignee.avatar}
                  name={`${assignee.firstName} ${assignee.lastName}`}
                  size="sm"
                />
                <View style={styles.pickerItemContent}>
                  <Text style={styles.pickerItemTitle}>{assignee.firstName} {assignee.lastName}</Text>
                  <Text style={styles.pickerItemSubtitle}>{assignee.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPriorityPicker = () => {
    const priorities = [
      { value: 'low', label: 'Low', color: '#10B981' },
      { value: 'medium', label: 'Medium', color: '#F59E0B' },
      { value: 'high', label: 'High', color: '#EF4444' },
      { value: 'urgent', label: 'Urgent', color: '#DC2626' },
    ];
    const selectedPriorityInfo = priorities.find(p => p.value === formData.priority);
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowPriorityPicker(!showPriorityPicker)}
        >
          {selectedPriorityInfo && (
            <View style={styles.selectedItem}>
              <Badge label={selectedPriorityInfo.label} size="sm" customColor={selectedPriorityInfo.color} />
            </View>
          )}
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {showPriorityPicker && (
          <View style={styles.pickerList}>
            {priorities.map(priority => (
              <TouchableOpacity
                key={priority.value}
                style={styles.pickerItem}
                onPress={() => selectPriority(priority.value as CreateTaskForm['priority'])}
              >
                <Badge label={priority.label} size="sm" customColor={priority.color} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTagsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tags</Text>
      <View style={styles.tagInputContainer}>
        <Input
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Add a tag"
          style={styles.tagInput}
          rightIcon={
            <TouchableOpacity onPress={addTag}>
              <Text style={styles.addTagButton}>Add</Text>
            </TouchableOpacity>
          }
          onSubmitEditing={addTag}
        />
      </View>
      {formData.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {formData.tags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => removeTag(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Input
            label="Task Title"
            value={formData.title}
            onChangeText={value => handleInputChange('title', value)}
            error={errors.title}
            placeholder="Enter task title"
            required
            maxLength={200}
          />
          <Input
            label="Description"
            value={formData.description}
            onChangeText={value => handleInputChange('description', value)}
            error={errors.description}
            placeholder="Describe the task in detail"
            multiline
            numberOfLines={4}
            required
            maxLength={1000}
          />
          {renderProjectPicker()}
          {renderAssigneePicker()}
          {renderPriorityPicker()}
          <Input
            label="Due Date"
            value={formData.dueDate}
            onChangeText={value => handleInputChange('dueDate', value)}
            error={errors.dueDate}
            placeholder="YYYY-MM-DD (optional)"
          />
          <Input
            label="Estimated Hours"
            value={formData.estimatedHours?.toString() || ''}
            onChangeText={value => handleInputChange('estimatedHours', parseInt(value) || 0)}
            placeholder="0"
            keyboardType="numeric"
          />
          {renderTagsSection()}
        </Card>
        <View style={styles.buttonContainer}>
          <Button
            title="Update Task"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    fontSize: FONT_SIZES.base,
    color: COLORS.error,
    fontWeight: '600',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formCard: {
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedItemText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  pickerPlaceholder: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  pickerArrow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  pickerList: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemContent: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  pickerItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  projectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagInputContainer: {
    marginBottom: SPACING.md,
  },
  tagInput: {
    marginBottom: 0,
  },
  addTagButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  tagRemove: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default EditTaskScreen;
