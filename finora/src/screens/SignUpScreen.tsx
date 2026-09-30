import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { colors, spacing, radius } from '../utils/theme';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import FinoraLogo from '../components/FinoraLogo';

const CURRENCIES = ['$', '€', '£', '¥', '₹', '₦', 'R', 'A$', 'C$', 'CHF'];

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currency, setCurrency] = useState('$');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (confirm !== password) {
      newErrors.confirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setGeneralError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateAuthProfile(cred.user, { displayName: name.trim() });
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: name.trim(),
          email: email.trim(),
          currency,
          monthlyBudget: 0,
          categoryLimits: {},
          createdAt: serverTimestamp(),
        });
      } catch (profileErr) {
        console.error('Initial profile write failed:', profileErr);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
      } else if (code === 'auth/weak-password') {
        setErrors((prev) => ({ ...prev, password: 'Password should be at least 6 characters' }));
      } else if (code === 'auth/invalid-email') {
        setErrors((prev) => ({ ...prev, email: 'Invalid email address' }));
      } else {
        setGeneralError(err?.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.brandHeader}>
          <FinoraLogo size={56} showWordmark />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Take control of your spending with Finora</Text>
        </View>

        {generalError ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={18} color={colors.expense} />
            <Text style={styles.errorBannerText}>{generalError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <AppInput
            label="Full Name"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="Jane Doe"
            error={errors.name}
          />

          <AppInput
            label="Email Address"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          {/* Currency Picker */}
          <View style={styles.currencySection}>
            <Text style={styles.fieldLabel}>Default Currency</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.currencyRow}
            >
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.currencyChip, currency === c && styles.currencyChipSelected]}
                  onPress={() => setCurrency(c)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.currencyChipText,
                      currency === c && styles.currencyChipTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <AppInput
            label="Password"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Minimum 6 characters"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <AppInput
            label="Confirm Password"
            value={confirm}
            onChangeText={(val) => {
              setConfirm(val);
              if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: '' }));
            }}
            placeholder="Re-type your password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirm}
          />

          <AppButton
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  currencySection: {
    marginBottom: spacing.md,
  },
  currencyRow: {
    gap: spacing.xs,
    paddingVertical: 4,
  },
  currencyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 44,
    alignItems: 'center',
  },
  currencyChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  currencyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  currencyChipTextSelected: {
    color: colors.white,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.expenseBg,
    padding: spacing.md,
    borderRadius: radius.input,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    color: colors.expense,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
});
