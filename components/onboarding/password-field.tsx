import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';

export type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'trailing'>;

/** A password input with an inline Show/Hide toggle. */
export function PasswordField(props: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!show}
      {...props}
      trailing={
        <PressableScale onPress={() => setShow((s) => !s)} style={styles.toggle} hitSlop={6}>
          <Text style={styles.toggleLabel}>{show ? 'Hide' : 'Show'}</Text>
        </PressableScale>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: colors.accent,
  },
});
