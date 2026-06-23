import { useRef } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { motion } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale applied while pressed (default 0.97, matching the prototype). */
  activeScale?: number;
}

/**
 * The app-wide pressable: a subtle press-in scale + dim, matching the
 * prototype's `.pressable` (transform: scale(0.97); opacity .9 over ~0.12s).
 */
export function PressableScale({
  style,
  activeScale = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateTo = (toScale: number, toOpacity: number) => {
    Animated.parallel([
      Animated.timing(scale, { toValue: toScale, duration: motion.press, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: toOpacity, duration: motion.press, useNativeDriver: true }),
    ]).start();
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) animateTo(activeScale, 0.9);
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    if (!disabled) animateTo(1, 1);
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { transform: [{ scale }], opacity }]}>
      {children}
    </AnimatedPressable>
  );
}

export default PressableScale;
