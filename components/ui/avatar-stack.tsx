import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import type { Member } from '@/data/models';
import { avatarStack } from '@/data/selectors';
import { Avatar } from './avatar';

export interface AvatarStackProps {
  members: Member[];
  /** Max avatars before collapsing into a "+N" chip. */
  max: number;
  size?: number;
  /** Overlap between avatars (negative margin). */
  overlap?: number;
  style?: StyleProp<ViewStyle>;
}

/** A row of overlapping member avatars with a trailing "+N" overflow chip,
 *  derived from the live member list. */
export function AvatarStack({ members, max, size = 26, overlap = 6, style }: AvatarStackProps) {
  const { shown, overflow } = avatarStack(members, max);
  return (
    <View style={[styles.row, style]}>
      {shown.map((m, i) => (
        <Avatar
          key={m.id}
          initials={m.initials}
          color={m.color}
          size={size}
          ring
          style={i > 0 ? { marginLeft: -overlap } : undefined}
        />
      ))}
      {overflow > 0 ? (
        <Avatar
          initials={`+${overflow}`}
          color={colors.avatarOverflowBg}
          textColor={colors.muted}
          size={size}
          ring
          fontSize={9}
          style={{ marginLeft: shown.length ? -overlap : 0 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
