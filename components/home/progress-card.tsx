import { StyleSheet, Text, View } from 'react-native';

import { AvatarStack } from '@/components/ui/avatar-stack';
import { colors, fonts, radius } from '@/constants/theme';
import type { Member } from '@/data/models';

export interface ProgressCardProps {
  finished: number;
  total: number;
  fraction: number;
  /** Members who've finished — their avatars stack here. */
  finishedMembers: Member[];
}

/** "Where everyone's at" — finished count, a progress bar, and the avatars of
 *  members who've finished the current read. All derived from the member list. */
export function ProgressCard({ finished, total, fraction, finishedMembers }: ProgressCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Where everyone&apos;s at</Text>
        <Text style={styles.count}>
          {finished} of {total} finished
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(fraction * 100)}%` }]} />
      </View>
      <AvatarStack members={finishedMembers} max={4} size={26} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  count: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.muted,
  },
  track: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.green,
  },
});
