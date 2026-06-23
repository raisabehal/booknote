import {
  Spectral_400Regular,
  Spectral_500Medium,
  Spectral_600SemiBold,
  Spectral_700Bold,
} from '@expo-google-fonts/spectral';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { BooknoteProvider, useBooknote } from '@/data/store';

// Keep the splash up until the Spectral + DM Sans faces are ready so we never
// flash a system-font first paint.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * The route gate. `Stack.Protected` swaps the whole navigation tree based on the
 * session: the onboarding flow when signed out, the tab app once entered. When
 * `authed` flips, expo-router redirects to the allowed group automatically.
 */
function RootNav() {
  const { authed } = useBooknote();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Protected guard={authed}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="schedule"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="book/[id]"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="profile"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!authed}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <BooknoteProvider>
        <RootNav />
      </BooknoteProvider>
    </SafeAreaProvider>
  );
}
