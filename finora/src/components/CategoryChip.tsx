import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../utils/theme';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryChip({ category, selected, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={category.icon}
        size={18}
        color={selected ? colors.white : category.color}
      />
      <Text style={[styles.text, selected && styles.textSelected]}>{category.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    marginLeft: spacing.xs,
  },
  textSelected: {
    color: colors.white,
  },
});
