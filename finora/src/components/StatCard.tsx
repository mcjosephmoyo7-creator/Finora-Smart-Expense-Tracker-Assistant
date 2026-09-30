import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../utils/theme';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color?: string;
  bgColor?: string;
}

export default function StatCard({ label, value, icon, color = colors.ink, bgColor }: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: bgColor || colors.surface }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
