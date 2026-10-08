import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../utils/theme';
import GoogleGIcon from './GoogleGIcon';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/**
 * "Continue with Google" button. Mirrors AppButton's dimensions (minHeight,
 * padding, pill radius, typography) so it matches the Finora design system,
 * with the official Google "G" logo on the left.
 */
export default function GoogleButton({
  onPress,
  disabled = false,
  loading = false,
  style,
}: GoogleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.brand} />
      ) : (
        <View style={styles.content}>
          <GoogleGIcon size={20} />
          <Text style={styles.text}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    // Same metrics as AppButton so it sits naturally in forms.
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.chip,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
});
