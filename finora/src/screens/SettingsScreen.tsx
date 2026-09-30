import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';

const CURRENCIES = ['$', '€', '£', '¥', '₹', '₦', 'R', 'A$', 'C$', 'CHF'];

export default function SettingsScreen(): JSX.Element {
  const { user, profile, updateProfile } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || '');
  const [showCurrency, setShowCurrency] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await updateProfile({ name: nameInput.trim() });
      setEditingName(false);
    } catch {
      Alert.alert('Error', 'Could not update name.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing info', 'Enter both current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Too short', 'New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setShowPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Done', 'Password updated successfully.');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login' || err.code === 'auth/wrong-password') {
        Alert.alert('Incorrect', 'Your current password is wrong.');
      } else {
        Alert.alert('Error', 'Could not change password. Try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.name || 'F')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Your name"
                  placeholderTextColor={colors.inkFaint}
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.iconBtn}>
                  <MaterialIcons name="check" size={20} color={colors.income} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingName(false)} style={styles.iconBtn}>
                  <MaterialIcons name="close" size={20} color={colors.inkFaint} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile?.name || 'User'}</Text>
                <TouchableOpacity onPress={() => { setNameInput(profile?.name || ''); setEditingName(true); }}>
                  <MaterialIcons name="edit" size={18} color={colors.brand} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.row} onPress={() => setShowCurrency(true)}>
            <MaterialIcons name="attach-money" size={20} color={colors.inkMuted} />
            <Text style={styles.rowLabel}>Currency</Text>
            <Text style={styles.rowValue}>{profile?.currency || '$'}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.inkFaint} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <TouchableOpacity style={styles.row} onPress={() => setShowPassword(true)}>
            <MaterialIcons name="lock" size={20} color={colors.inkMuted} />
            <Text style={styles.rowLabel}>Change password</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.inkFaint} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color={colors.danger} />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Finora v1.0.0</Text>
      </ScrollView>

      <Modal visible={showCurrency} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select currency</Text>
            <ScrollView>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.currencyOption}
                  onPress={async () => {
                    await updateProfile({ currency: c });
                    setShowCurrency(false);
                  }}
                >
                  <Text style={styles.currencyOptionText}>{c}</Text>
                  {profile?.currency === c && (
                    <MaterialIcons name="check" size={20} color={colors.brand} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowCurrency(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPassword} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change password</Text>
            <AppInput
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <AppInput
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <AppButton title="Update Password" onPress={handleChangePassword} loading={passwordLoading} />
            <TouchableOpacity onPress={() => setShowPassword(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.ink,
    marginRight: spacing.sm,
  },
  email: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  iconBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    marginLeft: spacing.md,
  },
  rowValue: {
    fontSize: 15,
    color: colors.inkMuted,
    marginRight: spacing.sm,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.danger,
    marginLeft: spacing.md,
  },
  version: {
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyOptionText: {
    fontSize: 16,
    color: colors.ink,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  modalCloseText: {
    fontSize: 15,
    color: colors.inkMuted,
  },
});
