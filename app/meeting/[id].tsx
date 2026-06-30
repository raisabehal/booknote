import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { DateChip } from '@/components/ui/date-chip';
import { BarChartIcon, PencilIcon } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { fmtDate, relLabel } from '@/data/format';
import { memberById } from '@/data/selectors';
import { useBooknote } from '@/data/store';

/** Meeting-details overlay opened from a "Coming up" row. Shows the date,
 *  when/where/host and book status; offers "See the vote" (if a vote is
 *  running) and "Edit meeting". */
export default function MeetingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, now } = useBooknote();

  const meeting = state.upcoming.find((u) => u.id === id);

  if (!meeting) {
    return (
      <View style={styles.root}>
        <Header onClose={() => router.back()} topInset={insets.top} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>This meeting is no longer on the schedule.</Text>
        </View>
      </View>
    );
  }

  const f = fmtDate(meeting.date, now);
  const host = memberById(state, meeting.hostId);
  const voting = meeting.book.kind === 'vote';
  const decided = meeting.book.kind === 'decided';

  const status = voting
    ? { label: 'Voting open', sub: 'The club is choosing the book', bg: colors.votePillBg, border: colors.votePillBorder, color: colors.goldDark, dot: colors.gold, dashed: false }
    : decided
      ? { label: meeting.book.kind === 'decided' ? meeting.book.title : '', sub: 'Confirmed pick', bg: colors.divider, border: colors.border, color: colors.inkSoft, dot: colors.green, dashed: false }
      : { label: 'Decide later', sub: 'Will be chosen closer to the date', bg: colors.white, border: colors.dashed, color: colors.warmLabel, dot: colors.dashed, dashed: true };

  const seeVote = () => {
    router.back();
    router.navigate('/vote');
  };
  const editMeeting = () => router.replace({ pathname: '/schedule', params: { mode: 'edit', id: meeting.id } });

  return (
    <View style={styles.root}>
      <Header onClose={() => router.back()} topInset={insets.top} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.dateRow}>
          <DateChip weekday={f.weekday} day={f.day} month={f.month} width={64} height={72} />
          <View style={styles.dateText}>
            <Text style={styles.dateLabel}>{f.label}</Text>
            <Text style={styles.relTime}>
              {relLabel(f.days)} · {meeting.time}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <DetailRow label="When" value={`${f.label} · ${meeting.time}`} />
          <DetailRow label="Where" value={meeting.place || 'Location not set yet'} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Host</Text>
            {host ? <Avatar initials={host.initials} color={host.color} size={22} fontSize={9} /> : null}
            <Text style={styles.detailValue}>{host?.name ?? '—'}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Book</Text>
        <View style={[styles.statusCard, { backgroundColor: status.bg, borderColor: status.border, borderStyle: status.dashed ? 'dashed' : 'solid' }]}>
          <View style={[styles.dot, { backgroundColor: status.dot }]} />
          <View style={styles.statusText}>
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            <Text style={styles.statusSub}>{status.sub}</Text>
          </View>
        </View>

        {voting ? (
          <PressableScale onPress={seeVote} style={styles.voteBtn}>
            <BarChartIcon size={16} color={colors.surface} />
            <Text style={styles.voteBtnLabel}>See the vote</Text>
          </PressableScale>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <PressableScale onPress={editMeeting} style={styles.editBtn}>
          <PencilIcon size={16} color={colors.accent} />
          <Text style={styles.editLabel}>Edit meeting</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function Header({ onClose, topInset }: { onClose: () => void; topInset: number }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 12 }]}>
      <Text style={styles.title}>Meeting details</Text>
      <PressableScale onPress={onClose} style={styles.close}>
        <Text style={styles.closeLabel}>✕</Text>
      </PressableScale>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.ink },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.muted },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  dateText: { minWidth: 0 },
  dateLabel: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.ink, lineHeight: 22 },
  relTime: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.muted, marginTop: 3 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 13,
    marginBottom: 16,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { width: 52, fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted2 },
  detailValue: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.ink },
  sectionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1.5,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  statusText: { flex: 1, minWidth: 0 },
  statusLabel: { fontFamily: fonts.sansSemiBold, fontSize: 14 },
  statusSub: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.muted4, marginTop: 2 },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.green,
    borderRadius: 13,
    paddingVertical: 14,
  },
  voteBtnLabel: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.surface },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 15,
  },
  editLabel: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.accent },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  missingText: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.muted, textAlign: 'center' },
});
