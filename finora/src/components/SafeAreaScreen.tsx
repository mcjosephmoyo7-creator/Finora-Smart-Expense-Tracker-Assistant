import React, { ReactNode } from 'react';
import { Platform, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaScreenProps {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  style?: StyleProp<ViewStyle>;
}

export default function SafeAreaScreen({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  style,
}: SafeAreaScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0
  );

  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: edges.includes('top') ? topInset : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
