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
import { COLORS, FONT_SIZES, SPACING} from '../constants';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { isValidEmail} from '../utils';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signIn, signUp, isLoading } = useAuthStore();
  const navigation = useNavigation();

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Sign up specific validations
    if (isSignUp) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isSignUp) {
        const result = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );

        if (result.success) {
          Alert.alert(
            'Success',
            'Account created successfully! Please check your email to verify your account.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        } else {
          Alert.alert('Error', result.error || 'Failed to create account');
        }
      } else {
        const result = await signIn(formData.email, formData.password);

        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to sign in');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    });
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.appName}>Taskies</Text>
      <Text style={styles.appTagline}>Manage your projects with ease</Text>
    </View>
  );

  const renderForm = () => (
    <Card style={styles.formCard}>
      <Text style={styles.formTitle}>
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </Text>
      <Text style={styles.formSubtitle}>
        {isSignUp
          ? 'Sign up to get started with Taskies'
          : 'Sign in to your account'}
      </Text>

      {isSignUp && (
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              placeholder="John"
              autoCapitalize="words"
              required
            />
          </View>
          <View style={styles.nameField}>
            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              placeholder="Doe"
              autoCapitalize="words"
              required
            />
          </View>
        </View>
      )}

      <Input
        label="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        error={errors.email}
        placeholder="john@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        error={errors.password}
        placeholder="Enter your password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="password"
        required
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.passwordToggle}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        }
      />

      {isSignUp && (
        <Input
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          required
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.passwordToggle}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          }
        />
      )}

      <Button
        title={isSignUp ? 'Create Account' : 'Sign In'}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={styles.submitButton}
      />

      {!isSignUp && (
        <TouchableOpacity style={styles.forgotPassword} onPress={() => (navigation as any).navigate('ForgotPasswordScreen')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderToggle = () => (
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleText}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      </Text>
      <TouchableOpacity onPress={toggleMode}>
        <Text style={styles.toggleLink}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderHeader()}
        {renderForm()}
        {renderToggle()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  appName: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  appTagline: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: SPACING.xl,
  },
  formTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  formSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nameField: {
    flex: 1,
  },
  passwordToggle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toggleText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  toggleLink: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: SPACING.md,
    width: '85%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  modalError: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  modalActionTextPrimary: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.base,
  },
  modalActionTextSecondary: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONT_SIZES.base,
  },
});

export default AuthScreen;
