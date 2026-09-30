import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/theme';
import { IconName } from '../types';

interface EmptyStateProps {
  icon?: IconName;
  message: string;
  subMessage?: string;
}

export default function EmptyState({ icon = 'inbox', message, subMessage }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={44} color={colors.inkFaint} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subMessage: {
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
