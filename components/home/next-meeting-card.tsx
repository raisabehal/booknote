import { StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PencilIcon } from '@/components/ui/icons';
import { colors, fonts, radius, shadows } from '@/constants/theme';
import type { Book, Member } from '@/data/models';

export interface NextMeetingCardProps {
  daysUntil: number;
  book?: Book;
  when: string;
  place: string;
  host?: Member;
  rsvp: boolean;
  onEdit: () => void;
  onRsvp: () => void;
  onDiscuss: () => void;
  onOpenBook: () => void;
}

export function NextMeetingCard({
  daysUntil,
  book,
  when,
  place,
  host,
  rsvp,
  onEdit,
  onRsvp,
  onDiscuss,
  onOpenBook,
}: NextMeetingCardProps) {
  const daysLabel = daysUntil <= 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;

  return (
    <View style={styles.card}>
      <View style={styles.bar}>
        <Text style={styles.barTitle}>Next meeting</Text>
        <View style={styles.barRight}>
          <Text style={styles.barDays}>{daysLabel}</Text>
          <PressableScale onPress={onEdit} style={styles.editBtn}>
            <PencilIcon size={11} color={colors.surface} />
            <Text style={styles.editLabel}>Edit</Text>
          </PressableScale>
        </View>
      </View>

      <View style={styles.body}>
        <PressableScale onPress={onOpenBook} style={styles.bookRow}>
          {book ? (
            <BookCover
              title={book.title}
              author={book.author}
              color={book.color}
              textColor={book.textColor}
              width={74}
              height={108}
              titleSize={13}
              padding={11}
              showAuthor
            />
          ) : null}
          <View style={styles.bookInfo}>
            <Text style={styles.discussing}>Discussing</Text>
            <Text style={styles.bookTitle}>{book?.title ?? '—'}</Text>
            <View style={styles.metaRows}>
              <MetaRow label="When" value={when} />
              <MetaRow label="Where" value={place || 'TBD'} />
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Host</Text>
                {host ? <Avatar initials={host.initials} color={host.color} size={20} fontSize={9} /> : null}
                <Text style={styles.metaValue}>{host?.name ?? '—'}</Text>
              </View>
            </View>
          </View>
        </PressableScale>

        <View style={styles.buttons}>
          <PressableScale
            onPress={onRsvp}
            style={[styles.rsvp, { backgroundColor: rsvp ? colors.green : colors.accent }]}>
            <Text style={styles.rsvpLabel}>{rsvp ? "✓ You're going" : "I'll be there"}</Text>
          </PressableScale>
          <PressableScale onPress={onDiscuss} style={styles.discuss}>
            <Text style={styles.discussLabel}>Discuss</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    ...shadows.cardRaised,
  },
  bar: {
    backgroundColor: colors.accent,
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.surface,
  },
  barRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  barDays: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.surface,
    opacity: 0.85,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 7,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  editLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.surface,
  },
  body: {
    padding: 16,
  },
  bookRow: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'flex-start',
  },
  bookInfo: {
    flex: 1,
    minWidth: 0,
  },
  discussing: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    letterSpacing: 0.95,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  bookTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 18,
    color: colors.ink,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: 12,
  },
  metaRows: {
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    width: 44,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.muted2,
  },
  metaValue: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  buttons: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 15,
  },
  rsvp: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },
  rsvpLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.white,
  },
  discuss: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discussLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.muted,
  },
});
