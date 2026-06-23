import { StyleSheet, Text, View } from 'react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { colors, fonts } from '@/constants/theme';
import { fmtDate, relLabel } from '@/data/format';
import {
  clubMeta,
  currentBook,
  hostOptions,
  meetingProgress,
  pollStatusLabel,
} from '@/data/selectors';
import { useBooknote } from '@/data/store';

/**
 * Milestone-2 readout: every value below is *derived* from the seeded club
 * (member list, meeting, poll) — nothing here is hardcoded. The real Home
 * layout replaces this in milestone 4.
 */
export default function HomeScreen() {
  const { state, now } = useBooknote();

  const meta = clubMeta(state);
  const progress = meetingProgress(state);
  const hosts = hostOptions(state);
  const book = currentBook(state);
  const next = fmtDate(state.meeting.date, now);
  const poll = state.polls[0];

  return (
    <ScreenPlaceholder title={state.club.name} subtitle={meta}>
      <View style={styles.card}>
        <Text style={styles.label}>DATA LAYER · LIVE FROM SEED</Text>

        <Row k="Members" v={`${state.members.length}`} />
        <Row k="Next meeting" v={`${next.label} · ${relLabel(next.days)}`} />
        <Row k="Reading" v={book ? book.title : '—'} />
        <Row k="Finished" v={`${progress.finished} of ${progress.total}`} />
        <Row k="Hosts available" v={`${hosts.length}`} />
        {poll ? <Row k="Poll" v={pollStatusLabel(poll, now)} /> : null}
      </View>
    </ScreenPlaceholder>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowKey}>{k}</Text>
      <Text style={styles.rowVal}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    color: colors.accent,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowKey: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.muted,
  },
  rowVal: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13.5,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
});
