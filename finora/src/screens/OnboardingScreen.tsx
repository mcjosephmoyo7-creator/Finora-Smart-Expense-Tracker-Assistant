import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { MaterialIcons as MaterialIconsFont } from '@expo/vector-icons';
import { colors, spacing, radius } from '../utils/theme';
import AppButton from '../components/AppButton';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const slides: Slide[] = [
  {
    title: 'Track every dollar',
    description: 'Log income and expenses in seconds. See exactly where your money goes.',
    icon: 'account-balance-wallet',
    color: colors.brand,
  },
  {
    title: 'Stay within budget',
    description: 'Set monthly limits and get real-time progress so you never overspend.',
    icon: 'savings',
    color: colors.income,
  },
  {
    title: 'Ask your assistant',
    description: 'Get instant answers about your spending, budgets, and trends.',
    icon: 'chat',
    color: colors.amber,
  },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrent(index);
  };

  const goToNext = () => {
    if (current < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={`slide-${index}`} style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: slide.color + '15' }]}>
              <MaterialIcons name={slide.icon} size={80} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, current === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        {current < slides.length - 1 ? (
          <>
            <AppButton title="Get Started" onPress={() => navigation.navigate('SignUp')} />
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.linkButton}>
              <Text style={styles.linkText}>I already have an account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AppButton title="Get Started" onPress={goToNext} />
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.linkButton}>
              <Text style={styles.linkText}>I already have an account</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.brand,
    width: 24,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  linkText: {
    fontSize: 15,
    color: colors.brand,
    fontWeight: '500',
  },
});
