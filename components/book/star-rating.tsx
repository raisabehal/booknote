import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors } from '@/constants/theme';

export interface StarRatingProps {
  /** Current rating 0–5. */
  rating: number;
  /** Tapping star n sets the rating; tapping the current rating clears it. */
  onRate: (star: number) => void;
  size?: number;
  gap?: number;
}

/** A 5-star control. Filled stars are gold; tapping the current rating clears. */
export function StarRating({ rating, onRate, size = 15, gap = 2 }: StarRatingProps) {
  return (
    <View style={[styles.row, { gap }]}>
      {[1, 2, 3, 4, 5].map((star) => (
        <PressableScale key={star} onPress={() => onRate(star)} hitSlop={4}>
          <Text style={{ fontSize: size, color: star <= rating ? colors.gold : '#D8C8AC' }}>★</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
