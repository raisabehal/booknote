import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bookshelf } from '@/components/home/bookshelf';
import { ComingUp, type BookPill, type UpcomingRow } from '@/components/home/coming-up';
import { NextMeetingCard } from '@/components/home/next-meeting-card';
import { ProgressCard } from '@/components/home/progress-card';
import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, spacing } from '@/constants/theme';
import { fmtDate } from '@/data/format';
import {
  clubMeta,
  currentBook,
  currentMember,
  meetingProgress,
  memberById,
} from '@/data/selectors';
import { useBooknote } from '@/data/store';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, now, actions } = useBooknote();

  const me = currentMember(state);
  const book = currentBook(state);
  const host = memberById(state, state.meeting.hostId);
  const next = fmtDate(state.meeting.date, now);
  const progress = meetingProgress(state);
  const readCount = state.books.filter((b) => b.status === 'read').length;

  const openEditUpcoming = (id: string) =>
    router.push({ pathname: '/schedule', params: { mode: 'edit', id } });

  const rows: UpcomingRow[] = [...state.upcoming]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((u) => {
      const f = fmtDate(u.date, now);
      const h = memberById(state, u.hostId);
      const place = u.place ? ` · ${u.place}` : '';

      let pill: BookPill;
      let onPress: () => void;
      if (u.book.kind === 'vote') {
        pill = {
          label: 'Voting open',
          dotColor: colors.gold,
          textColor: colors.goldDark,
          borderColor: colors.votePillBorder,
          dashed: false,
        };
        onPress = () => router.navigate('/vote');
      } else if (u.book.kind === 'decided') {
        pill = {
          label: u.book.title,
          dotColor: colors.green,
          textColor: colors.inkSoft,
          borderColor: colors.border,
          dashed: false,
        };
        onPress = () => openEditUpcoming(u.id);
      } else {
        pill = {
          label: 'Book — decide later',
          dotColor: colors.dashed,
          textColor: colors.warmLabel,
          borderColor: colors.dashed,
          dashed: true,
        };
        onPress = () => openEditUpcoming(u.id);
      }

      return {
        id: u.id,
        weekday: f.weekday,
        day: f.day,
        month: f.month,
        hostInitials: h?.initials ?? '?',
        hostColor: h?.color ?? colors.muted,
        hostLabel: `Hosted by ${h?.name ?? '—'}${place}`,
        timeLabel: u.time,
        pill,
        onPress,
      };
    });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.clubName}>{state.club.name}</Text>
          <Text style={styles.clubMeta}>{clubMeta(state)}</Text>
        </View>
        <PressableScale onPress={() => router.push('/profile')}>
          <Avatar
            initials={me?.initials ?? 'YO'}
            color={me?.color ?? colors.accent}
            textColor={colors.surface}
            size={42}
            fontSize={15}
          />
        </PressableScale>
      </View>

      <NextMeetingCard
        daysUntil={next.days}
        book={book}
        when={`${next.label} · ${state.meeting.time}`}
        place={state.meeting.place}
        host={host}
        rsvp={state.rsvp}
        onEdit={() => router.push({ pathname: '/schedule', params: { mode: 'next' } })}
        onRsvp={actions.toggleRsvp}
        onDiscuss={() => router.navigate('/chat')}
        onOpenBook={() => book && router.push({ pathname: '/book/[id]', params: { id: book.id } })}
      />

      <ProgressCard
        finished={progress.finished}
        total={progress.total}
        fraction={progress.fraction}
        finishedMembers={progress.finishedMembers}
      />

      <ComingUp
        rows={rows}
        onPlanMeeting={() => router.push({ pathname: '/schedule', params: { mode: 'add' } })}
      />

      <View style={styles.shelfHeader}>
        <Text style={styles.shelfTitle}>On the shelf</Text>
        <PressableScale onPress={() => router.navigate('/shelf')}>
          <Text style={styles.shelfLink}>See all {readCount} →</Text>
        </PressableScale>
      </View>
      <Bookshelf onOpenBook={(id) => router.push({ pathname: '/book/[id]', params: { id } })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screenX,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  clubName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 25,
    color: colors.ink,
    lineHeight: 26,
  },
  clubMeta: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 3,
  },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 2,
    paddingBottom: 8,
  },
  shelfTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  shelfLink: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: colors.accent,
  },
});
