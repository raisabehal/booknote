import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, motion } from '@/constants/theme';

export interface CandidateView {
  id: string;
  title: string;
  author: string;
  color: string;
  /** 0–100; the fill bar animates to this width. */
  pct: number;
  votesLabel: string;
  byLabel: string;
  voted: boolean;
}

/** A tap-to-vote bar: a fill whose width animates to the live percentage, the
 *  book cover, title/author, the % and vote count, and the vote tag. */
export function CandidateRow({ candidate, onVote }: { candidate: CandidateView; onVote: () => void }) {
  const width = useRef(new Animated.Value(candidate.pct)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: candidate.pct,
      duration: motion.voteBar,
      useNativeDriver: false,
    }).start();
  }, [candidate.pct, width]);

  const fillWidth = width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const voted = candidate.voted;

  return (
    <PressableScale
      onPress={onVote}
      style={[styles.row, { borderColor: voted ? colors.accent : colors.border }]}>
      <Animated.View
        style={[
          styles.fill,
          { width: fillWidth, backgroundColor: voted ? 'rgba(189,93,56,0.14)' : 'rgba(120,108,90,0.07)' },
        ]}
      />
      <View style={styles.content}>
        <BookCover
          title={candidate.title}
          color={candidate.color}
          width={38}
          height={54}
          titleSize={7.5}
          padding={5}
          radius={4}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {candidate.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {candidate.author}
          </Text>
          <Text style={styles.by} numberOfLines={1}>
            {candidate.byLabel}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.pct}>{candidate.pct}%</Text>
          <Text style={styles.votes}>{candidate.votesLabel}</Text>
          <Text style={[styles.tag, { color: voted ? colors.accent : colors.muted3 }]}>
            {voted ? '✓ Your vote' : 'Tap to vote'}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.white,
    padding: 12,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 16,
  },
  author: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  by: {
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    color: colors.muted4,
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
  },
  pct: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 18,
    color: colors.ink,
    lineHeight: 18,
  },
  votes: {
    fontFamily: fonts.sansRegular,
    fontSize: 9.5,
    color: colors.muted2,
    marginTop: 2,
  },
  tag: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    marginTop: 5,
  },
});
