import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { StarRating } from '@/components/book/star-rating';
import { PhotoAlbum } from '@/components/photo/photo-album';
import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, motion } from '@/constants/theme';
import { fmtDate } from '@/data/format';
import { bookById, memberScores, photosFor, recapAttendees, topicsFor } from '@/data/selectors';
import { useBooknote } from '@/data/store';

const RATING_LABELS = [
  'Tap a star to rate',
  '1 — Not for me',
  '2 — It was okay',
  '3 — Liked it',
  '4 — Really good',
  '5 — A new favourite',
];

export default function BookDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, now, actions } = useBooknote();
  const book = bookById(state, id);

  const [showScores, setShowScores] = useState(false);
  const rot = useRef(new Animated.Value(0)).current;

  if (!book) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Book not found</Text>
        <PressableScale onPress={() => router.back()} style={[styles.closeFloating, { top: insets.top + 8 }]}>
          <Text style={styles.closeLabel}>✕</Text>
        </PressableScale>
      </View>
    );
  }

  const isRead = book.status === 'read';
  const statusLabel = isRead
    ? `Read · ${book.date}`
    : `Reading now · discuss ${fmtDate(state.meeting.date, now).label}`;
  const clubRatingLabel = book.clubRating == null ? '—' : `${book.clubRating.toFixed(1)} ★`;
  const scores = memberScores(state, book);
  const recapTopics = topicsFor(state, book.id);
  const attendees = recapAttendees(state, book);
  const photos = photosFor(state, book.id);

  const toggleScores = () => {
    const next = !showScores;
    setShowScores(next);
    Animated.timing(rot, { toValue: next ? 1 : 0, duration: motion.press, useNativeDriver: true }).start();
  };
  const chevronRotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const openDiscussion = () => {
    router.back();
    router.navigate('/chat');
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={[styles.cover, { backgroundColor: book.color }]}>
        <LinearGradient colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']} style={styles.coverTopFade} />
        <LinearGradient
          colors={['rgba(43,33,26,0)', 'rgba(43,33,26,0.62)', colors.background]}
          locations={[0, 0.6, 1]}
          style={styles.coverBottomFade}
        />
        <PressableScale onPress={() => router.back()} style={[styles.closeFloating, { top: insets.top + 8 }]}>
          <Text style={styles.closeLabel}>✕</Text>
        </PressableScale>
        <View style={styles.coverText}>
          <Text style={styles.status}>{statusLabel.toUpperCase()}</Text>
          <Text style={styles.coverTitle}>{book.title}</Text>
          <Text style={styles.coverAuthor}>{book.author}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.genrePill}>
          <Text style={styles.genrePillLabel}>{book.genre}</Text>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingCardLabel}>Your rating</Text>
          <StarRating rating={book.myRating} onRate={(star) => actions.rateBook(book.id, star)} size={30} gap={6} />
          <Text style={styles.ratingLabel}>{RATING_LABELS[book.myRating] ?? RATING_LABELS[0]}</Text>
        </View>

        <View style={styles.statRow}>
          <PressableScale onPress={toggleScores} style={styles.statCard}>
            <Text style={styles.statValue}>{clubRatingLabel}</Text>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>Club average</Text>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#C3B091" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="m6 9 6 6 6-6" />
                </Svg>
              </Animated.View>
            </View>
          </PressableScale>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{book.date}</Text>
            <Text style={styles.statLabel}>Discussed</Text>
          </View>
        </View>

        {showScores ? (
          <View style={styles.scoresCard}>
            <Text style={styles.recapLabel}>Individual scores</Text>
            <View style={styles.scoreList}>
              {scores.map((s) => (
                <View key={s.name} style={styles.scoreRow}>
                  <Avatar initials={s.initials} color={s.color} size={24} fontSize={9} />
                  <Text style={styles.scoreName}>{s.name}</Text>
                  <View style={styles.scoreStars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Text key={n} style={[styles.scoreStar, { color: n <= s.score ? colors.gold : '#D8C8AC' }]}>
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.aboutTitle}>About</Text>
        <Text style={styles.blurb}>{book.blurb}</Text>

        {isRead ? (
          <View style={styles.recap}>
            <View style={styles.recapHeader}>
              <Text style={styles.recapTitle}>Meeting night</Text>
              <Text style={styles.recapDate}>{book.date}</Text>
            </View>

            <Text style={styles.recapLabel}>
              Attendees <Text style={styles.recapLabelSoft}>· {attendees.countLabel}</Text>
            </Text>
            <View style={styles.attendees}>
              {attendees.members.map((a) => (
                <View key={a.name} style={styles.attendChip}>
                  <Avatar initials={a.initials} color={a.color} size={22} fontSize={9} />
                  <Text style={styles.attendName}>{a.name}</Text>
                </View>
              ))}
              {attendees.moreLabel ? <Text style={styles.attendMore}>{attendees.moreLabel}</Text> : null}
            </View>

            <Text style={[styles.recapLabel, { marginTop: 18 }]}>Photos</Text>
            <View style={{ marginBottom: 18 }}>
              <PhotoAlbum
                photos={photos}
                onAdd={(uri) => actions.addPhoto(book.id, uri)}
                onRemove={(i) => actions.removePhoto(book.id, i)}
                size={96}
              />
            </View>

            <Text style={styles.recapLabel}>What we discussed</Text>
            {recapTopics.length > 0 ? (
              <View style={styles.topicList}>
                {recapTopics.map((t) => (
                  <View key={t.id} style={styles.topicRow}>
                    <Text style={styles.qBadge}>Q</Text>
                    <Text style={styles.topicText}>{t.text}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyNote}>No saved discussion notes from this meeting.</Text>
            )}
          </View>
        ) : null}

        <PressableScale onPress={openDiscussion} style={styles.discussBtn}>
          <Text style={styles.discussLabel}>Go to group chat →</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  cover: { height: 340, position: 'relative' },
  coverTopFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 96 },
  coverBottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 210 },
  closeFloating: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: { color: colors.white, fontSize: 17, fontFamily: fonts.sansMedium },
  coverText: { position: 'absolute', left: 20, right: 20, bottom: 14 },
  status: { fontFamily: fonts.sansSemiBold, fontSize: 10.5, letterSpacing: 0.95, color: colors.surface, opacity: 0.85 },
  coverTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 28,
    color: colors.surface,
    lineHeight: 30,
    marginTop: 3,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 16,
  },
  coverAuthor: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.surface, opacity: 0.95 },
  body: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },
  genrePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.divider,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 11,
    marginBottom: 16,
  },
  genrePillLabel: { fontFamily: fonts.sansRegular, fontSize: 11, color: '#7d6f60' },
  ratingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ratingCardLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.inkSoft, marginBottom: 10 },
  ratingLabel: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.muted2, marginTop: 6 },
  statRow: { flexDirection: 'row', gap: 11, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.ink, lineHeight: 26 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted2,
  },
  scoresCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },
  scoreList: { gap: 11 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreName: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.ink },
  scoreStars: { flexDirection: 'row', gap: 2, marginLeft: 'auto' },
  scoreStar: { fontSize: 13, lineHeight: 14 },
  aboutTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  blurb: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 21, color: colors.inkSoft, marginBottom: 18 },
  recap: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 18, marginBottom: 18 },
  recapHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 13 },
  recapTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.ink },
  recapDate: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.muted4 },
  recapLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.77,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 9,
  },
  recapLabelSoft: { fontFamily: fonts.sansMedium, color: '#B7A892', textTransform: 'none', letterSpacing: 0 },
  attendees: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginBottom: 18 },
  attendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 11,
  },
  attendName: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.inkSoft },
  attendMore: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.muted4, paddingHorizontal: 5 },
  topicList: { gap: 8 },
  topicRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  qBadge: { fontFamily: fonts.serifBold, fontSize: 13, color: colors.accent, lineHeight: 17 },
  topicText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.ink, lineHeight: 17 },
  emptyNote: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted4, lineHeight: 17 },
  discussBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
  },
  discussLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.muted },
  missing: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  missingText: { fontFamily: fonts.serifSemiBold, fontSize: 20, color: colors.ink },
});
