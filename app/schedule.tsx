import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Calendar } from '@/components/schedule/calendar';
import { Avatar } from '@/components/ui/avatar';
import { BarChartIcon } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { calTo, fmtDate, relLabel } from '@/data/format';
import type { BookSelection } from '@/data/models';
import { defaultNextMeetingDate, hostOptions } from '@/data/selectors';
import { useBooknote, type ScheduleMode } from '@/data/store';

const TIMES = ['6:30pm', '7:00pm', '7:30pm', '8:00pm'];

interface DraftInit {
  date: string;
  time: string;
  place: string;
  hostId: string;
  bookText: string;
  voteMode: boolean;
}

export default function ScheduleSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string; id?: string }>();
  const { state, now, actions } = useBooknote();

  const editId = typeof params.id === 'string' ? params.id : undefined;
  const mode: ScheduleMode =
    params.mode === 'next' ? 'next' : params.mode === 'edit' ? 'editUpcoming' : 'add';

  // Compute the starting draft once.
  const initRef = useRef<DraftInit>(undefined);
  if (!initRef.current) {
    if (mode === 'next') {
      const m = state.meeting;
      initRef.current = { date: m.date, time: m.time, place: m.place, hostId: m.hostId, bookText: '', voteMode: false };
    } else if (mode === 'editUpcoming') {
      const u = state.upcoming.find((x) => x.id === editId);
      initRef.current = u
        ? {
            date: u.date,
            time: u.time,
            place: u.place,
            hostId: u.hostId,
            bookText: u.book.kind === 'decided' ? u.book.title : '',
            voteMode: u.book.kind === 'vote',
          }
        : { date: defaultNextMeetingDate(state, now), time: '7:30pm', place: '', hostId: 'you', bookText: '', voteMode: false };
    } else {
      initRef.current = {
        date: defaultNextMeetingDate(state, now),
        time: '7:30pm',
        place: '',
        hostId: state.user?.id ?? 'you',
        bookText: '',
        voteMode: false,
      };
    }
  }
  const init = initRef.current;

  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);
  const [place, setPlace] = useState(init.place);
  const [hostId, setHostId] = useState(init.hostId);
  const [bookText, setBookText] = useState(init.bookText);
  const [voteMode, setVoteMode] = useState(init.voteMode);
  const [cal, setCal] = useState(() => calTo(init.date));

  const showBookPicker = mode !== 'next';
  const decidedActive = !voteMode && bookText.trim().length > 0;
  const laterActive = !voteMode && bookText.trim().length === 0;

  const calPrev = () =>
    setCal((c) => (c.calMonth === 0 ? { calYear: c.calYear - 1, calMonth: 11 } : { ...c, calMonth: c.calMonth - 1 }));
  const calNext = () =>
    setCal((c) => (c.calMonth === 11 ? { calYear: c.calYear + 1, calMonth: 0 } : { ...c, calMonth: c.calMonth + 1 }));

  const draftInfo = fmtDate(date, now);
  const hosts = hostOptions(state);

  const title = mode === 'next' ? 'Edit next meeting' : mode === 'add' ? 'Schedule a meeting' : 'Edit meeting';
  const cta = mode === 'next' ? 'Save meeting' : mode === 'add' ? 'Add to schedule' : 'Save changes';
  const bookHint = voteMode
    ? "You'll set up the options on the next screen, then the club votes."
    : laterActive
      ? 'No rush — you can pick the book closer to the date.'
      : 'Everyone will see this as the confirmed pick.';

  const onSave = () => {
    const book: BookSelection = voteMode
      ? { kind: 'vote', pollId: '' }
      : bookText.trim()
        ? { kind: 'decided', title: bookText.trim() }
        : { kind: 'later' };
    const result = actions.saveMeeting({ date, time, place, hostId, book }, mode, editId);
    router.back();
    if (result.votePollId) {
      // Deep-link to the Vote tab with this poll's add-option panel open.
      router.navigate({ pathname: '/vote', params: { suggest: result.votePollId } });
    }
  };

  const onRemove = () => {
    if (editId) actions.removeUpcoming(editId);
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{title}</Text>
        <PressableScale onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeLabel}>✕</Text>
        </PressableScale>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Date</Text>
        <Calendar
          year={cal.calYear}
          month={cal.calMonth}
          selectedIso={date}
          now={now}
          onSelect={setDate}
          onPrev={calPrev}
          onNext={calNext}
        />
        <View style={styles.dateChosen}>
          <View style={styles.greenDot} />
          <Text style={styles.dateChosenLabel}>
            {draftInfo.label} · {relLabel(draftInfo.days)}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Time</Text>
        <View style={styles.timeRow}>
          {TIMES.map((t) => {
            const sel = t === time;
            return (
              <PressableScale
                key={t}
                onPress={() => setTime(t)}
                style={[
                  styles.timePill,
                  { backgroundColor: sel ? colors.accent : colors.white, borderColor: sel ? colors.accent : colors.border },
                ]}>
                <Text style={[styles.timeLabel, { color: sel ? colors.surface : colors.inkSoft }]}>{t}</Text>
              </PressableScale>
            );
          })}
        </View>

        {showBookPicker ? (
          <>
            <Text style={styles.sectionLabel}>Book</Text>
            <TextField
              value={voteMode ? '' : bookText}
              onChangeText={(v) => {
                setVoteMode(false);
                setBookText(v);
              }}
              placeholder="Type the book you'll read"
              borderColor={decidedActive ? colors.accent : colors.border}
              containerStyle={styles.bookInput}
            />
            <View style={styles.modeRow}>
              <PressableScale
                onPress={() => {
                  setVoteMode(false);
                  setBookText('');
                }}
                style={[
                  styles.modeBtn,
                  styles.modeDashed,
                  {
                    backgroundColor: laterActive ? colors.divider : colors.white,
                    borderColor: laterActive ? colors.dashed : colors.border,
                  },
                ]}>
                <Text style={[styles.modeTitle, { color: laterActive ? '#7a6a52' : colors.muted }]}>Decide later</Text>
                <Text style={[styles.modeSub, { color: laterActive ? '#7a6a52' : colors.muted }]}>pick closer to the date</Text>
              </PressableScale>
              <PressableScale
                onPress={() => setVoteMode(true)}
                style={[
                  styles.modeBtn,
                  {
                    backgroundColor: voteMode ? 'rgba(189,93,56,0.12)' : colors.white,
                    borderColor: voteMode ? colors.accent : colors.border,
                  },
                ]}>
                <View style={styles.modeTitleRow}>
                  <BarChartIcon size={14} color={voteMode ? colors.accentDark : colors.muted} />
                  <Text style={[styles.modeTitle, { color: voteMode ? colors.accentDark : colors.muted }]}>Put it to a vote</Text>
                </View>
                <Text style={[styles.modeSub, { color: voteMode ? colors.accentDark : colors.muted }]}>let the club choose</Text>
              </PressableScale>
            </View>
            <Text style={styles.bookHint}>{bookHint}</Text>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Where</Text>
        <TextField
          value={place}
          onChangeText={setPlace}
          placeholder="Add a location (optional)"
          containerStyle={styles.whereInput}
        />

        <Text style={styles.sectionLabel}>Host</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hostRow}>
          {hosts.map((m) => {
            const sel = m.id === hostId;
            return (
              <PressableScale key={m.id} onPress={() => setHostId(m.id)} style={styles.hostItem}>
                <View
                  style={[
                    styles.hostRing,
                    {
                      borderColor: sel ? m.color : 'transparent',
                      backgroundColor: sel ? colors.surface : 'transparent',
                      opacity: sel ? 1 : 0.5,
                    },
                  ]}>
                  <Avatar initials={m.initials} color={m.color} size={42} fontSize={13} />
                </View>
                <Text style={[styles.hostName, { opacity: sel ? 1 : 0.5 }]} numberOfLines={1}>
                  {m.name}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {mode === 'editUpcoming' ? (
          <PressableScale onPress={onRemove} style={styles.remove}>
            <Text style={styles.removeLabel}>Remove this meeting</Text>
          </PressableScale>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <PressableScale onPress={onSave} style={styles.cta}>
          <Text style={styles.ctaLabel}>{cta}</Text>
        </PressableScale>
      </View>
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
  sectionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 10,
    marginTop: 22,
  },
  dateChosen: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, marginTop: 14 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  dateChosenLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.inkSoft },
  timeRow: { flexDirection: 'row', gap: 9 },
  timePill: { flex: 1, borderWidth: 1.5, borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  timeLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13.5 },
  bookInput: { marginBottom: 10 },
  modeRow: { flexDirection: 'row', gap: 9, marginBottom: 8 },
  modeBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 8, alignItems: 'center', gap: 3 },
  modeDashed: { borderStyle: 'dashed' },
  modeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeTitle: { fontFamily: fonts.sansSemiBold, fontSize: 13 },
  modeSub: { fontFamily: fonts.sansMedium, fontSize: 10.5, opacity: 0.85 },
  bookHint: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted3, lineHeight: 17 },
  whereInput: {},
  hostRow: { gap: 18, paddingHorizontal: 2, paddingVertical: 4 },
  hostItem: { alignItems: 'center', gap: 7, width: 56 },
  hostRing: { borderWidth: 2.5, borderRadius: 999, padding: 2.5 },
  hostName: { fontFamily: fonts.sansRegular, fontSize: 10, color: colors.muted, textAlign: 'center' },
  remove: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#E4CFC4',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  removeLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: '#B5503A' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  ctaLabel: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.surface },
});
