import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/back-button';
import { colors, fonts } from '@/constants/theme';

export interface OnboardingShellProps {
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  /** Pinned to the bottom (primary CTA + any links). */
  footer?: ReactNode;
}

/**
 * Shared chrome for the onboarding screens: warm-paper full screen with safe
 * top padding, an optional back chevron, a Spectral title + subtitle, a
 * scrollable body, and a footer pinned above the bottom safe area. Avoids the
 * keyboard on both platforms.
 */
export function OnboardingShell({ onBack, title, subtitle, children, footer }: OnboardingShellProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <View style={[styles.inner, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 18 }]}>
        {onBack ? <BackButton onPress={onBack} /> : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {title ? (
            <View style={styles.heading}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 26,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 18,
  },
  heading: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 30,
    color: colors.ink,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: colors.muted,
    marginTop: 7,
    lineHeight: 20,
  },
  footer: {
    paddingTop: 18,
    gap: 13,
  },
});
