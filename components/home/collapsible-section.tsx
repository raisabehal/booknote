import { ReactNode, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, motion } from '@/constants/theme';

export interface CollapsibleSectionProps {
  icon: ReactNode;
  label: string;
  /** Right-aligned teaser text (e.g. "3 going" / "2 topics"). */
  teaser?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

/** A meeting-card row that collapses by default; tap the header to expand.
 *  Keeps Home uncluttered while housing dietary needs / topics / photos. */
export function CollapsibleSection({
  icon,
  label,
  teaser,
  defaultExpanded = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const rot = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rot, { toValue: next ? 1 : 0, duration: motion.press, useNativeDriver: true }).start();
  };

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.section}>
      <PressableScale onPress={toggle} style={styles.header}>
        <View style={styles.left}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.right}>
          {teaser ? <Text style={styles.teaser}>{teaser}</Text> : null}
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#C3B091" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <Path d="m6 9 6 6 6-6" />
            </Svg>
          </Animated.View>
        </View>
      </PressableScale>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    letterSpacing: 0.95,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  teaser: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.muted4 },
  body: { marginTop: 12 },
});
