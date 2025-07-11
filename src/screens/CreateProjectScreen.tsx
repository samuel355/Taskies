import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { CreateProjectForm } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import DateTimePicker from '@react-native-community/datetimepicker';
//import { isValidEmail } from '../utils';

const CreateProjectScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createProject, isLoading } = useProjectStore();

  const [formData, setFormData] = useState<CreateProjectForm>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📋',
    deadline: '',
    priority: 'medium',
    budget: 0,
    tags: [],
    members: [],
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    color: '',
    icon: '',
    deadline: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      color: '',
      icon: '',
      deadline: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.icon.trim()) {
      newErrors.icon = 'Icon is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    try {
      const projectData: Omit<import('../types').Project, 'id' | 'createdAt' | 'updatedAt' | 'members'> = {
        ...formData,
        owner_id: user.id,
        deadline: formData.deadline ? formData.deadline : undefined,
        status: 'active',
        progress: 0,
      };

      const result = await createProject(projectData);

      if (result.success) {
        Alert.alert('Success', 'Project created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create project');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButton}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Create Project</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Input
            label="Project Name *"
            value={formData.name}
            onChangeText={value => handleInputChange('name', value)}
            error={errors.name}
            placeholder="Enter project name"
            required
          />

          <Input
            label="Description *"
            value={formData.description}
            onChangeText={value => handleInputChange('description', value)}
            error={errors.description}
            placeholder="Describe your project"
            multiline
            numberOfLines={4}
            required
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerTouchable}>
            <Input
              label="Deadline (YYYY-MM-DD)"
              value={formData.deadline}
              editable={false}
              pointerEvents="none"
              placeholder="Select deadline (optional)"
              error={errors.deadline}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.deadline ? new Date(formData.deadline) : new Date()}
              mode="date"
              //display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === 'set' && selectedDate) {
                  handleInputChange('deadline', selectedDate.toISOString().slice(0, 10));
                }
              }}
              minimumDate={new Date()}
            />
          )}

          <Input
            label="Budget"
            value={(formData.budget ?? 0).toString()}
            onChangeText={value =>
              handleInputChange('budget', parseInt(value, 10) || 0)
            }
            keyboardType="numeric"
            placeholder="0"
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Project"
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
  buttonContainer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  datePickerTouchable: {
    marginBottom: 16,
  },
});

export default CreateProjectScreen;
