import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/theme';

interface EmptyStateProps {
  icon?: string;
  message: string;
  subMessage?: string;
}

export default function EmptyState({ icon = 'inbox', message, subMessage }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={48} color={colors.inkFaint} />
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
