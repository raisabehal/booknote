import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';

/**
 * Milestone-1 stand-in for a tab screen. It renders an on-brand header
 * (Spectral title + DM Sans subtitle on warm paper) so the running scaffold
 * visibly proves the fonts, tokens and navigation are wired up. Each real
 * screen replaces this in a later milestone.
 */
export function ScreenPlaceholder({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.screenTop - 24 }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

/** A small on-brand card explaining which milestone fills in this screen. */
export function ScaffoldNote({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteLabel}>{label}</Text>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenX,
  },
  note: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  noteLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    color: colors.accent,
  },
  noteText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 27,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: colors.muted,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenPlaceholder;
