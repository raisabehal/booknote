import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import { PressableScale } from './pressable-scale';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  /** Optional leading icon (e.g. an SVG glyph). */
  icon?: React.ReactNode;
  /** Background colour — defaults to the terracotta accent. */
  color?: string;
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The pinned-to-bottom primary CTA: full-width, 52px tall, terracotta. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  color = colors.accent,
  textColor = colors.surface,
  disabled,
  style,
}: PrimaryButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }, style]}>
      <View style={styles.primaryInner}>
        {icon}
        <Text style={[styles.primaryLabel, { color: textColor }]}>{label}</Text>
      </View>
    </PressableScale>
  );
}

export interface TextButtonProps {
  label: string;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** A borderless text button (e.g. "I already have an account"). */
export function TextButton({ label, onPress, color = colors.muted, style }: TextButtonProps) {
  return (
    <PressableScale onPress={onPress} style={[styles.text, style]}>
      <Text style={[styles.textLabel, { color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  primary: {
    borderRadius: radius.input + 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  primaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
  text: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  textLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
  },
});
