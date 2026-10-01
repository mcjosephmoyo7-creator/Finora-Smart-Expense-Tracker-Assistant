import React, { useEffect, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

const BRAND = '#0E5A4A';
const BAR_TARGETS = [22, 38, 56];

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const tile = useMemo(() => new Animated.Value(0), []);
  const bars = useMemo(() => BAR_TARGETS.map(() => new Animated.Value(0)), []);
  const word = useMemo(() => new Animated.Value(0), []);
  const tagline = useMemo(() => new Animated.Value(0), []);
  const screen = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(tile, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.stagger(
        140,
        bars.map((b) =>
          Animated.timing(b, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.back(1.4)),
            useNativeDriver: false,
          })
        )
      ),
      Animated.timing(word, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(tagline, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(screen, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => onFinish && onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screen }]}>
      <Animated.View
        style={[
          styles.tile,
          { opacity: tile, transform: [{ scale: tile.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] },
        ]}
      >
        <View style={styles.barRow}>
          {bars.map((b, i) => (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  height: b.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_TARGETS[i]] }),
                  backgroundColor: i === 2 ? '#F2C14E' : '#FFFFFF',
                  opacity: i === 2 ? 1 : 0.9,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.word,
          {
            opacity: word,
            transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        Finora
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: tagline }]}>
        Know where your money goes.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 22,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  word: {
    marginTop: 28,
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
});
