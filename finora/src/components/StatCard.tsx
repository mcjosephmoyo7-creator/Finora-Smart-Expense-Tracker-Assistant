import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../utils/theme';
import { IconName } from '../types';

interface StatCardProps {
  label: string;
  value: string;
  icon: IconName;
  color?: string;
  bgColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  color = colors.ink,
  bgColor,
}: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: bgColor || colors.background }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
