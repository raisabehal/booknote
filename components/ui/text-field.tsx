import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';

export interface TextFieldProps extends TextInputProps {
  /** Uppercase section label above the input. */
  label?: string;
  /** Optional element rendered next to the label (e.g. a "Forgot?" link). */
  labelAccessory?: React.ReactNode;
  /** Optional trailing element inside the field (e.g. a Show/Hide toggle). */
  trailing?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** Border colour override (used to highlight a confirmed selection). */
  borderColor?: string;
}

/** A labelled text input matching the prototype: uppercase label, white fill,
 *  warm border, DM Sans 15. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, labelAccessory, trailing, containerStyle, borderColor = colors.border, style, ...rest },
  ref,
) {
  return (
    <View style={containerStyle}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {labelAccessory}
        </View>
      ) : null}
      <View style={[styles.field, { borderColor }]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.muted3}
          style={[styles.input, style]}
          {...rest}
        />
        {trailing}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputFill,
    borderWidth: 1,
    borderRadius: radius.input,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    color: colors.ink,
  },
});
