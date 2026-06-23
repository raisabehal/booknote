import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { PressableScale } from './pressable-scale';

/** Circular, bordered back chevron used at the top of onboarding screens. */
export function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.button} hitSlop={8}>
      <Text style={styles.chevron}>‹</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontFamily: fonts.sansMedium,
    fontSize: 22,
    lineHeight: 26,
    color: colors.inkSoft,
    marginTop: -2,
  },
});
