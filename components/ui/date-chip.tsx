import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export interface DateChipProps {
  weekday: string;
  day: string;
  month: string;
  /** Chip size variants used across Home (50×56) and Vote (46×52). */
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** The warm date chip — uppercase weekday, big Spectral day, month — used on
 *  the Coming-up rows and Vote cards. */
export function DateChip({ weekday, day, month, width = 50, height = 56, style }: DateChipProps) {
  return (
    <View style={[styles.chip, { width, height }, style]}>
      <Text style={styles.weekday}>{weekday}</Text>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.month}>{month}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 11,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.warmLabel,
  },
  day: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 21,
    lineHeight: 22,
    color: colors.ink,
  },
  month: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    color: colors.warmLabel,
  },
});
