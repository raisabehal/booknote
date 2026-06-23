import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { StarRating } from '@/components/book/star-rating';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { currentBook, genreBreakdown, readBooks, shelfStats } from '@/data/selectors';
import { useBooknote } from '@/data/store';

export default function ShelfScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, actions } = useBooknote();

  const stats = shelfStats(state);
  const genres = genreBreakdown(state);
  const reading = currentBook(state);
  const read = readBooks(state);

  const openBook = (id: string) => router.push({ pathname: '/book/[id]', params: { id } });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>The Shelf</Text>
      <Text style={styles.subtitle}>Everything {state.club.name} has read &amp; rated</Text>

      <View style={styles.stats}>
        <Stat value={String(stats.count)} label="Books read" />
        <Stat value={stats.avg} accent=" ★" label="Avg rating" />
        <Stat value={String(stats.genres)} label="Genres" />
      </View>

      <View style={styles.genreCard}>
        <Text style={styles.cardTitle}>What we read</Text>
        <View style={styles.genreList}>
          {genres.map((g) => (
            <View key={g.name} style={styles.genreRow}>
              <Text style={styles.genreName} numberOfLines={1}>
                {g.name}
              </Text>
              <View style={styles.genreTrack}>
                <View style={[styles.genreFill, { width: `${g.pct}%`, backgroundColor: g.color }]} />
              </View>
              <Text style={styles.genreCount}>{g.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {reading ? (
        <>
          <Text style={styles.sectionTitle}>Currently reading</Text>
          <PressableScale onPress={() => openBook(reading.id)} style={styles.readingCard}>
            <BookCover
              title={reading.title}
              color={reading.color}
              textColor={reading.textColor}
              width={46}
              height={66}
              titleSize={9}
            />
            <View style={styles.readingText}>
              <Text style={styles.readingTitle}>{reading.title}</Text>
              <Text style={styles.readingAuthor}>{reading.author}</Text>
              <Text style={styles.readingCta}>Rate it after the meeting →</Text>
            </View>
          </PressableScale>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Recently read</Text>
      <View style={styles.readList}>
        {read.map((b) => (
          <View key={b.id} style={styles.readRow}>
            <PressableScale onPress={() => openBook(b.id)}>
              <BookCover title={b.title} color={b.color} textColor={b.textColor} width={46} height={66} titleSize={9} />
            </PressableScale>
            <View style={styles.readInfo}>
              <PressableScale onPress={() => openBook(b.id)}>
                <Text style={styles.readTitle}>{b.title}</Text>
              </PressableScale>
              <Text style={styles.readAuthor}>{b.author}</Text>
              <View style={styles.genrePill}>
                <Text style={styles.genrePillLabel}>{b.genre}</Text>
              </View>
              <View style={styles.ratingRow}>
                <View style={styles.myRating}>
                  <Text style={styles.ratingLabel}>You</Text>
                  <StarRating rating={b.myRating} onRate={(star) => actions.rateBook(b.id, star)} size={15} />
                </View>
                <View style={styles.clubRating}>
                  <Text style={styles.ratingLabel}>Club</Text>
                  <Text style={styles.clubValue}>{b.clubRating?.toFixed(1) ?? '—'}</Text>
                  <Text style={styles.clubStar}>★</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Stat({ value, accent, label }: { value: string; accent?: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
        {accent ? <Text style={styles.statAccent}>{accent}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.screenX },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 27, color: colors.ink, marginBottom: 4 },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.muted, marginBottom: 16 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardSm,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.ink, lineHeight: 28 },
  statAccent: { fontSize: 14, color: colors.gold },
  statLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginTop: 3,
  },
  genreCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
  },
  cardTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.ink, marginBottom: 12 },
  genreList: { gap: 9 },
  genreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  genreName: { width: 104, fontFamily: fonts.sansRegular, fontSize: 12, color: colors.inkSoft },
  genreTrack: { flex: 1, height: 9, borderRadius: 99, backgroundColor: colors.divider, overflow: 'hidden' },
  genreFill: { height: '100%', borderRadius: 99 },
  genreCount: { width: 18, textAlign: 'right', fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.muted },
  sectionTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.ink, marginBottom: 10 },
  readingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardSm,
    padding: 13,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    marginBottom: 20,
  },
  readingText: { flex: 1, minWidth: 0 },
  readingTitle: { fontFamily: fonts.serifSemiBold, fontSize: 16, color: colors.ink, lineHeight: 18 },
  readingAuthor: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted, marginTop: 1 },
  readingCta: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.accent, marginTop: 6 },
  readList: { gap: 10 },
  readRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardSm,
    padding: 13,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
  },
  readInfo: { flex: 1, minWidth: 0 },
  readTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15.5, color: colors.ink, lineHeight: 17 },
  readAuthor: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted, marginTop: 1 },
  genrePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.divider,
    borderRadius: 99,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  genrePillLabel: { fontFamily: fonts.sansRegular, fontSize: 10, color: '#7d6f60' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9 },
  myRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingLabel: { fontFamily: fonts.sansRegular, fontSize: 9, color: colors.muted2 },
  clubRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 10,
  },
  clubValue: { fontFamily: fonts.sansSemiBold, fontSize: 12.5, color: colors.inkSoft },
  clubStar: { fontSize: 11, color: colors.gold },
});
