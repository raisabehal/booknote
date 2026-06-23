import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  textColor?: string;
  /** Cream ring used when avatars overlap in a stack. */
  ring?: boolean;
  /** Override the auto-sized initials text. */
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

/** A circular member avatar with white initials, weight 700. */
export function Avatar({
  initials,
  color,
  size = 26,
  textColor = colors.white,
  ring = false,
  fontSize,
  style,
}: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        ring && styles.ring,
        style,
      ]}>
      <Text style={[styles.initials, { color: textColor, fontSize: fontSize ?? Math.round(size * 0.36) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    borderColor: colors.surface,
  },
  initials: {
    fontFamily: fonts.sansBold,
  },
});
