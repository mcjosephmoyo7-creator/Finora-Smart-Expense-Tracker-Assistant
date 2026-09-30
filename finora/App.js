import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from './src/screens/SplashScreen';
import { AuthProvider } from './src/context/AuthContext';
import { TransactionProvider } from './src/context/TransactionContext';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreenNative.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // MaterialIcons.font makes the icon glyphs load reliably
  const [fontsLoaded] = useFonts({
    ...MaterialIcons.font,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_800ExtraBold,
  });

  // hide the native splash as soon as our animated one can take over
  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreenNative.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <AuthProvider>
          <TransactionProvider>
            <View style={{ flex: 1 }}>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
              {showSplash && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <SplashScreen onFinish={() => setShowSplash(false)} />
                </View>
              )}
            </View>
          </TransactionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
