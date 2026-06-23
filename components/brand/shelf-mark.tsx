import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

/** The 5 spines of the logo shelf, tallest-to-shortest mix, in spec colours. */
const SPINES = [
  { w: 30, h: 92, color: '#BD5D38' },
  { w: 25, h: 72, color: '#5B7355' },
  { w: 35, h: 104, color: '#C99A2E' },
  { w: 23, h: 64, color: '#7B6A9C' },
  { w: 28, h: 84, color: '#4F7A82' },
];

/**
 * The Booknote logo mark — 5 colored book spines on a brown shelf, built in
 * views (as in the prototype). `scale` resizes the whole still-life.
 */
export function ShelfMark({ scale = 1 }: { scale?: number }) {
  return (
    <View style={{ transform: [{ scale }] }}>
      <View style={styles.spines}>
        {SPINES.map((s, i) => (
          <View key={i} style={[styles.spine, { width: s.w, height: s.h, backgroundColor: s.color }]}>
            {/* Thin left highlight to hint the rounded spine, à la the inset shadow. */}
            <View style={styles.highlight} />
          </View>
        ))}
      </View>
      <View style={styles.wood} />
    </View>
  );
}

const styles = StyleSheet.create({
  spines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 108,
  },
  spine: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 1.5,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  wood: {
    height: 8,
    marginHorizontal: -8,
    borderRadius: 2,
    backgroundColor: colors.shelfWood,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
});
