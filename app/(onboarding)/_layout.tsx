import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

/** The first-run flow: welcome → account → choose → join / create. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  );
}
