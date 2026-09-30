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
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../utils/theme';
import { IconName } from '../types';
import AppButton from '../components/AppButton';
import FinoraLogo from '../components/FinoraLogo';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
  icon: IconName;
  color: string;
}

const slides: Slide[] = [
  {
    title: 'Track every dollar',
    description: 'Log your income and expenses in seconds. Always know where your money goes.',
    icon: 'account-balance-wallet',
    color: colors.brand,
  },
  {
    title: 'Stay within budget',
    description: 'Set custom monthly and category limits. Get proactive alerts before you overspend.',
    icon: 'savings',
    color: colors.income,
  },
  {
    title: 'Ask your assistant',
    description: 'A smart assistant that reads your live transactions and gives plain-English answers.',
    icon: 'chat',
    color: colors.amber,
  },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrent(index);
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
    } else {
      navigation.navigate('SignUp');
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand Header */}
      <View style={styles.topBar}>
        <FinoraLogo size={42} showWordmark />
      </View>

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
              <MaterialIcons name={slide.icon} size={72} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Slide Dots Indicator */}
      <View style={styles.dots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, current === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <AppButton
          title={current === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.linkButton}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? spacing.xxl + 10 : spacing.xl,
    paddingBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.brand,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    gap: spacing.sm,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
  },
});
