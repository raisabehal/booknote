import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { bookById } from '@/data/selectors';
import { useBooknote } from '@/data/store';

/**
 * Placeholder for the full Book-detail overlay (large cover, blurb, club
 * rating, 5-star my-rating). The full screen arrives in milestone 7; this stub
 * resolves the taps from the Home card and bookshelf.
 */
export default function BookDetailStub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useBooknote();
  const book = bookById(state, id);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <PressableScale onPress={() => router.back()} style={styles.close}>
        <Text style={styles.closeLabel}>✕</Text>
      </PressableScale>
      <View style={styles.body}>
        {book ? (
          <>
            <BookCover
              title={book.title}
              author={book.author}
              color={book.color}
              textColor={book.textColor}
              width={120}
              height={176}
              titleSize={16}
              showAuthor
            />
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
          </>
        ) : (
          <Text style={styles.title}>Book not found</Text>
        )}
        <Text style={styles.note}>Full book detail — blurb, ratings, your 5-star control — lands in milestone 7.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  close: {
    alignSelf: 'flex-end',
    marginRight: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.inkSoft,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 8,
  },
  author: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: colors.muted,
  },
  note: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.muted3,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});
