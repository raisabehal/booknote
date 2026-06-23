import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { colors, fonts } from '@/constants/theme';

/**
 * The four-tab shell: Home / Shelf / Vote / Chat. Active tab uses the
 * terracotta accent, inactive is muted — over the cream surface bar.
 *
 * Web/mobile-browser hardening: the bar carries a generous bottom clearance so
 * the labels sit above the browser's bottom chrome (Safari's address/tool bar),
 * and enough total height that the icon + label never get clipped internally.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // On web, browsers under-report the bottom safe area while their bottom UI
  // still overlaps content, so floor the clearance higher there.
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'web' ? 28 : 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 58 + bottomInset,
          paddingBottom: bottomInset,
        },
        tabBarIconStyle: { marginTop: 2 },
        tabBarLabelStyle: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 10,
          lineHeight: 13,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shelf"
        options={{
          title: 'Shelf',
          tabBarIcon: ({ color }) => <TabBarIcon name="shelf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          title: 'Vote',
          tabBarIcon: ({ color }) => <TabBarIcon name="vote" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="chat" color={color} />,
        }}
      />
    </Tabs>
  );
}
