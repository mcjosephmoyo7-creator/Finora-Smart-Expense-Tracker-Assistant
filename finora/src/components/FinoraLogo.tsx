import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

interface FinoraLogoProps {
  size?: number;
  showWordmark?: boolean;
  tagline?: string;
  light?: boolean;
  style?: ViewStyle;
}

export default function FinoraLogo({
  size = 56,
  showWordmark = false,
  tagline,
  light = false,
  style,
}: FinoraLogoProps) {
  const iconBoxSize = size;
  const barWidth = Math.max(3, Math.round(size * 0.1));
  const radiusSize = Math.round(size * 0.28);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.emblem,
          {
            width: iconBoxSize,
            height: iconBoxSize,
            borderRadius: radiusSize,
            backgroundColor: light ? 'rgba(255,255,255,0.15)' : colors.brand,
            borderWidth: light ? 1.5 : 0,
            borderColor: light ? 'rgba(255,255,255,0.3)' : 'transparent',
          },
        ]}
      >
        {/* Modern financial glyph: 3 progressive bars and an ascending trend accent */}
        <View style={styles.glyphContainer}>
          <View
            style={[
              styles.bar,
              {
                width: barWidth,
                height: size * 0.28,
                backgroundColor: light ? '#FFFFFF' : '#A7F3D0',
                opacity: 0.85,
              },
            ]}
          />
          <View
            style={[
              styles.bar,
              {
                width: barWidth,
                height: size * 0.44,
                backgroundColor: light ? '#FFFFFF' : '#34D399',
                opacity: 0.95,
              },
            ]}
          />
          <View
            style={[
              styles.bar,
              {
                width: barWidth,
                height: size * 0.6,
                backgroundColor: '#F2C14E', // Gold accent representing wealth/growth
              },
            ]}
          />
          <View
            style={[
              styles.trendDot,
              {
                width: Math.max(4, Math.round(barWidth * 1.2)),
                height: Math.max(4, Math.round(barWidth * 1.2)),
                borderRadius: barWidth,
                backgroundColor: '#F2C14E',
              },
            ]}
          />
        </View>
      </View>

      {showWordmark && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.brandName,
              {
                color: light ? '#FFFFFF' : colors.ink,
                fontSize: Math.max(18, Math.round(size * 0.42)),
              },
            ]}
          >
            Finora
          </Text>
          {tagline ? (
            <Text
              style={[
                styles.tagline,
                { color: light ? 'rgba(255,255,255,0.75)' : colors.inkMuted },
              ]}
            >
              {tagline}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E5A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  glyphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: '70%',
    paddingBottom: 2,
    position: 'relative',
  },
  bar: {
    borderRadius: 3,
  },
  trendDot: {
    position: 'absolute',
    top: -4,
    right: -3,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
