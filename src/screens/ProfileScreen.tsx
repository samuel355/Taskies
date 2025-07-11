import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../constants';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

const ProfileScreen = () => {
  const { user, signOut, isLoading, updateProfile, updatePassword } = useAuthStore();
  const { getUserProjects } = useProjectStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Not signed in</Text>
      </View>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const userProjects = getUserProjects(user.id);
  const projectsCreated = userProjects.filter(p => p.owner_id === user.id).length;

  // Edit Profile Handlers
  const handleEditProfile = () => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || '',
    });
    setEditModalVisible(true);
  };
  const handleEditSubmit = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      Alert.alert('Validation', 'First and last name are required.');
      return;
    }
    setEditLoading(true);
    const res = await updateProfile({
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      avatar: editForm.avatar,
    });
    setEditLoading(false);
    if (res.success) {
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated!');
    } else {
      Alert.alert('Error', res.error || 'Failed to update profile.');
    }
  };

  // Change Password Handlers
  const handleChangePassword = () => {
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordModalVisible(true);
  };
  const handlePasswordSubmit = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      Alert.alert('Validation', 'Password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    const res = await updatePassword(passwordForm.newPassword);
    setPasswordLoading(false);
    if (res.success) {
      setPasswordModalVisible(false);
      Alert.alert('Success', 'Password updated!');
    } else {
      Alert.alert('Error', res.error || 'Failed to update password.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Avatar
          src={user.avatar || undefined}
          name={fullName}
          size="2xl"
          variant="circle"
          showBorder
          style={styles.avatar}
        />
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{projectsCreated}</Text>
            <Text style={styles.statLabel}>Projects Created</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={handleEditProfile}
            style={styles.button}
          />
          <Button
            title="Change Password"
            variant="outline"
            onPress={handleChangePassword}
            style={styles.button}
          />
          <Button
            title="Logout"
            variant="danger"
            onPress={signOut}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </View>
      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={editForm.firstName}
              onChangeText={text => setEditForm(f => ({ ...f, firstName: text }))}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={editForm.lastName}
              onChangeText={text => setEditForm(f => ({ ...f, lastName: text }))}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Avatar URL (optional)"
              value={editForm.avatar}
              onChangeText={text => setEditForm(f => ({ ...f, avatar: text }))}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                onPress={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalButtonText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.gray300 }]}
                onPress={() => setEditModalVisible(false)}
                disabled={editLoading}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChangeText={text => setPasswordForm(f => ({ ...f, newPassword: text }))}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={passwordForm.confirmPassword}
              onChangeText={text => setPasswordForm(f => ({ ...f, confirmPassword: text }))}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                onPress={handlePasswordSubmit}
                disabled={passwordLoading}
              >
                {passwordLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalButtonText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.gray300 }]}
                onPress={() => setPasswordModalVisible(false)}
                disabled={passwordLoading}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  avatar: {
    marginTop: SPACING['2xl'],
    marginBottom: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  role: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  email: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  actions: {
    width: '100%',
    marginTop: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8, // Assuming BORDER_RADIUS.md is not defined, using 8 for now
    shadowColor: COLORS.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: FONTS.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'stretch',
    shadowColor: COLORS.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.gray100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.base,
  },
});

export default ProfileScreen;
