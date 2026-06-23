import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';

/** The six spines on the shelf, mapped to their seeded book ids. */
const SPINES = [
  { id: 'wager', w: 30, h: 86, color: '#BD5D38', text: '#FBE9DF', label: 'The Wager' },
  { id: 'tomlake', w: 25, h: 72, color: '#5B7355', text: '#E9F0E2', label: 'Tom Lake' },
  { id: 'demon', w: 34, h: 90, color: '#C99A2E', text: '#FBF2DC', label: 'Demon Copperhead' },
] as const;

const SPINES_RIGHT = [
  { id: 'trust', w: 23, h: 66, color: '#7B6A9C', text: '#EFEAF5', label: 'Trust' },
  { id: 'yellow', w: 31, h: 82, color: '#4F7A82', text: '#E5EFF1', label: 'Yellowface' },
  { id: 'babel', w: 27, h: 76, color: '#A6533B', text: '#F6E6E0', label: 'Babel' },
] as const;

export interface BookshelfProps {
  onOpenBook: (id: string) => void;
}

/** The warm still-life: aloe, colored book spines (tappable → book detail),
 *  a coffee mug and a muffin, sitting on a wooden shelf. */
export function Bookshelf({ onOpenBook }: BookshelfProps) {
  return (
    <View style={styles.stage}>
      <View style={styles.objects}>
        <AloePlant />
        {SPINES.map((s) => (
          <Spine key={s.id} spine={s} onPress={() => onOpenBook(s.id)} />
        ))}
        <View style={styles.mug}>
          <CoffeeMug />
        </View>
        <View style={styles.muffin}>
          <Muffin />
        </View>
        {SPINES_RIGHT.map((s) => (
          <Spine key={s.id} spine={s} onPress={() => onOpenBook(s.id)} />
        ))}
      </View>
      <View style={styles.wood} />
    </View>
  );
}

function Spine({
  spine,
  onPress,
}: {
  spine: { w: number; h: number; color: string; text: string; label: string };
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.spine, { width: spine.w, height: spine.h, backgroundColor: spine.color }]}>
      <View style={styles.spineHighlight} />
      <Text
        numberOfLines={1}
        style={[styles.spineLabel, { color: spine.text, width: spine.h - 16 }]}>
        {spine.label}
      </Text>
    </PressableScale>
  );
}

// --- still-life illustrations (SVG, since RN has no clip-path) ---

function AloePlant() {
  const leaf = (rotate: number, h: number, fill: string) => (
    <G rotation={rotate} origin="30, 70">
      <Path d={`M30 ${70 - h} C36 ${70 - h * 0.5} 35 68 30 70 C25 68 24 ${70 - h * 0.5} 30 ${70 - h} Z`} fill={fill} />
    </G>
  );
  return (
    <Svg width={50} height={70} viewBox="0 0 60 84">
      {leaf(-48, 40, '#5B7355')}
      {leaf(48, 40, '#7FA06A')}
      {leaf(-26, 50, '#6E8B5A')}
      {leaf(26, 50, '#5B7355')}
      {leaf(0, 56, '#6E8B5A')}
      {/* pot */}
      <Path d="M18 66 H42 L39 84 H21 Z" fill="#BD5D38" />
      <Rect x={16} y={63} width={28} height={6} rx={3} fill="#C96B45" />
    </Svg>
  );
}

function CoffeeMug() {
  return (
    <Svg width={32} height={30} viewBox="0 0 36 34">
      {/* steam */}
      <Path d="M12 2 C10 5 14 6 12 9" stroke="#C3B091" strokeWidth={1.6} fill="none" opacity={0.5} strokeLinecap="round" />
      <Path d="M18 0 C16 3 20 4 18 7" stroke="#C3B091" strokeWidth={1.6} fill="none" opacity={0.45} strokeLinecap="round" />
      {/* handle */}
      <Path d="M25 16 a6 6 0 0 1 0 11" stroke="#D6C4A8" strokeWidth={2.5} fill="none" />
      {/* body */}
      <Path d="M5 13 H26 V26 a4 4 0 0 1 -4 4 H9 a4 4 0 0 1 -4 -4 Z" fill={colors.surface} stroke="#D6C4A8" strokeWidth={1.5} />
      <Rect x={8} y={13} width={15} height={4} rx={2} fill="#7A5A42" />
    </Svg>
  );
}

function Muffin() {
  return (
    <Svg width={38} height={31} viewBox="0 0 42 34">
      {/* plate */}
      <Ellipse cx={21} cy={30} rx={20} ry={4} fill="#DACDB6" />
      <Ellipse cx={21} cy={29} rx={16} ry={2.5} fill="#EDE3D2" />
      {/* wrapper */}
      <Path d="M9 18 H33 L30 30 H12 Z" fill="#E7C98F" />
      <Path d="M15 19 V29 M21 19 V30 M27 19 V29" stroke="#D2B173" strokeWidth={1.4} />
      {/* muffin top */}
      <Path d="M8 19 C8 8 34 8 34 19 Z" fill="#A6733F" />
      <Path d="M14 14 a6 5 0 0 1 12 0 Z" fill="#B5824C" />
      <Circle cx={16} cy={15} r={1.6} fill="#4A3526" />
      <Circle cx={25} cy={16} r={1.6} fill="#4A3526" />
      <Circle cx={21} cy={12} r={1.3} fill="#4A3526" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  stage: {
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#E7D9BF',
  },
  objects: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  mug: {
    marginLeft: 4,
  },
  muffin: {
    marginLeft: 4,
  },
  spine: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  spineHighlight: {
    position: 'absolute',
    left: 1.5,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  spineLabel: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 8.5,
    transform: [{ rotate: '-90deg' }],
    textAlign: 'left',
  },
  wood: {
    height: 8,
    marginHorizontal: -10,
    borderRadius: 2,
    backgroundColor: colors.shelfWood,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
