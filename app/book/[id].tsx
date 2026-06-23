import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StarRating } from '@/components/book/star-rating';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { fmtDate } from '@/data/format';
import { bookById } from '@/data/selectors';
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

  if (!book) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Book not found</Text>
        <PressableScale onPress={() => router.back()} style={styles.closeFloating}>
          <Text style={styles.closeLabel}>✕</Text>
        </PressableScale>
      </View>
    );
  }

  const statusLabel =
    book.status === 'reading'
      ? `Reading now · discuss ${fmtDate(state.meeting.date, now).label}`
      : `Read · ${book.date}`;
  const clubRatingLabel = book.clubRating == null ? '—' : `${book.clubRating.toFixed(1)} ★`;

  const openDiscussion = () => {
    router.back();
    router.navigate('/chat');
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={[styles.cover, { backgroundColor: book.color }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
          style={styles.coverTopFade}
        />
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
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{clubRatingLabel}</Text>
            <Text style={styles.statLabel}>Club average</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{book.date}</Text>
            <Text style={styles.statLabel}>Discussed</Text>
          </View>
        </View>

        <Text style={styles.aboutTitle}>About</Text>
        <Text style={styles.blurb}>{book.blurb}</Text>

        <PressableScale onPress={openDiscussion} style={styles.discussBtn}>
          <Text style={styles.discussLabel}>Open the discussion →</Text>
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
  status: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    letterSpacing: 0.95,
    color: colors.surface,
    opacity: 0.85,
  },
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
    marginBottom: 14,
  },
  ratingCardLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.inkSoft, marginBottom: 10 },
  ratingLabel: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.muted2, marginTop: 6 },
  statRow: { flexDirection: 'row', gap: 11, marginBottom: 18 },
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
  statLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginTop: 4,
  },
  aboutTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  blurb: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 21, color: colors.inkSoft, marginBottom: 18 },
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
