import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import { isValidEmail } from '../utils';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleReset = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    const result = await resetPassword(email);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>Enter your email to receive a password reset link.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
          placeholderTextColor={COLORS.textSecondary}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button
          title="Send Reset Link"
          onPress={handleReset}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.md,
  },
});

export default ForgotPasswordScreen; 