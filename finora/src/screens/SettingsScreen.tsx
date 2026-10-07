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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, shadows } from '../utils/theme';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import FinoraLogo from '../components/FinoraLogo';
import SafeAreaScreen from '../components/SafeAreaScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CURRENCIES = ['$', '€', '£', '¥', '₹', '₦', 'R', 'A$', 'C$', 'CHF'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, updateProfile } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || '');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await updateProfile({ name: nameInput.trim() });
      setEditingName(false);
      Alert.alert('Success', 'Profile name updated.');
    } catch {
      Alert.alert('Error', 'Could not update name.');
    }
  };

  const handleSelectCurrency = async (curr: string) => {
    try {
      await updateProfile({ currency: curr });
      setShowCurrencyModal(false);
    } catch {
      Alert.alert('Error', 'Could not update currency.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing info', 'Please enter both current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'New password must be at least 6 characters.');
      return;
    }
    if (!user || !user.email) {
      Alert.alert('Error', 'User account not found.');
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Your password has been changed successfully.');
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        Alert.alert('Incorrect password', 'Your current password was entered incorrectly.');
      } else {
        Alert.alert('Error', err?.message || 'Could not change password. Try again later.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of Finora?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <SafeAreaScreen edges={['top', 'right', 'left']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Account & Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || user?.displayName || 'F')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Your full name"
                  placeholderTextColor={colors.inkFaint}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.iconActionBtn}>
                  <MaterialIcons name="check" size={20} color={colors.income} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNameInput(profile?.name || '');
                    setEditingName(false);
                  }}
                  style={styles.iconActionBtn}
                >
                  <MaterialIcons name="close" size={20} color={colors.inkFaint} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayRow}>
                <Text style={styles.profileName}>
                  {profile?.name || user?.displayName || 'Finora User'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setNameInput(profile?.name || user?.displayName || '');
                    setEditingName(true);
                  }}
                  style={styles.iconActionBtn}
                >
                  <MaterialIcons name="edit" size={16} color={colors.brand} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.profileEmail}>{user?.email || 'No email registered'}</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowCurrencyModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <MaterialIcons name="monetization-on" size={20} color={colors.brand} />
              </View>
              <View style={styles.settingMiddle}>
                <Text style={styles.settingLabel}>Currency Symbol</Text>
                <Text style={styles.settingSub}>Choose your default display currency</Text>
              </View>
              <Text style={styles.settingValue}>{profile?.currency || '$'}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.inkFaint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Security</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowPasswordModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                <MaterialIcons name="lock-outline" size={20} color={colors.ink} />
              </View>
              <View style={styles.settingMiddle}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingSub}>Update your login credentials</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.inkFaint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <MaterialIcons name="logout" size={20} color={colors.expense} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Footer */}
        <View style={styles.footer}>
          <FinoraLogo size={32} />
          <Text style={styles.footerBrand}>Finora Smart Expense Tracker</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 · Final Project Edition</Text>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <View
          style={[
            styles.modalOverlay,
            {
              paddingTop: spacing.xl + insets.top,
              paddingBottom: spacing.xl + insets.bottom,
            },
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Currency</Text>
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.currencyOption,
                    profile?.currency === c && styles.currencyOptionSelected,
                  ]}
                  onPress={() => handleSelectCurrency(c)}
                >
                  <Text
                    style={[
                      styles.currencyOptionText,
                      profile?.currency === c && styles.currencyOptionTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <AppButton
              title="Close"
              variant="secondary"
              onPress={() => setShowCurrencyModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalKeyboardArea}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            style={[
              styles.modalOverlay,
              {
                paddingTop: spacing.xl + insets.top,
                paddingBottom: spacing.xl + insets.bottom,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <AppInput
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                />
                <AppInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  secureTextEntry
                />
                <View style={styles.modalActions}>
                  <AppButton
                    title="Update Password"
                    onPress={handleChangePassword}
                    loading={passwordLoading}
                  />
                  <AppButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.xxxl * 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  iconActionBtn: {
    padding: 6,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingMiddle: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  settingSub: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
    marginRight: spacing.xs,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.expenseBg,
    gap: spacing.sm,
  },
  signOutText: {
    color: colors.expense,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: 4,
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  footerVersion: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalKeyboardArea: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  currencyOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyOptionSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  currencyOptionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  currencyOptionTextSelected: {
    color: colors.white,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
