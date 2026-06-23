import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { buildCalendar, MOL, type CalendarCell } from '@/data/format';

const WEEKDAY_HEADS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface CalendarProps {
  year: number;
  month: number; // 0-based
  selectedIso: string;
  now: Date;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Month calendar in a card. Today is ringed, the selected day is a filled green
 * circle. Past days are rendered muted but remain selectable (and prev-month
 * navigation is unlocked) so the club can backfill meetings/books it has
 * already read.
 */
export function Calendar({ year, month, selectedIso, now, onSelect, onPrev, onNext }: CalendarProps) {
  const cells = buildCalendar(year, month, selectedIso, now);
  // Pad to a whole number of 7-day rows, then chunk into weeks.
  const padded: CalendarCell[] = [...cells];
  while (padded.length % 7 !== 0) {
    padded.push({ empty: true, day: '', iso: '', isPast: false, selected: false, isToday: false });
  }
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <PressableScale onPress={onPrev} style={styles.arrow}>
          <Text style={styles.arrowLabel}>‹</Text>
        </PressableScale>
        <Text style={styles.monthLabel}>
          {MOL[month]} {year}
        </Text>
        <PressableScale onPress={onNext} style={styles.arrow}>
          <Text style={styles.arrowLabel}>›</Text>
        </PressableScale>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_HEADS.map((w, i) => (
          <View key={i} style={styles.headCell}>
            <Text style={styles.headLabel}>{w}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((c, ci) => (
            <Day key={ci} cell={c} onSelect={onSelect} />
          ))}
        </View>
      ))}
    </View>
  );
}

function Day({ cell, onSelect }: { cell: CalendarCell; onSelect: (iso: string) => void }) {
  if (cell.empty) return <View style={styles.dayCell} />;

  const bg = cell.selected ? colors.green : cell.isToday ? colors.divider : 'transparent';
  const textColor = cell.selected
    ? colors.surface
    : cell.isPast
      ? colors.muted2
      : colors.ink;

  return (
    <View style={styles.dayCell}>
      <PressableScale
        onPress={() => onSelect(cell.iso)}
        style={[
          styles.dayButton,
          { backgroundColor: bg },
          cell.isToday && !cell.selected ? styles.todayRing : null,
        ]}>
        <Text
          style={[
            styles.dayLabel,
            { color: textColor, fontFamily: cell.selected || cell.isToday ? fonts.sansBold : fonts.sansMedium },
          ]}>
          {cell.day}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    lineHeight: 20,
    color: colors.muted,
    marginTop: -2,
  },
  monthLabel: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  weekRow: {
    flexDirection: 'row',
  },
  headCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  headLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: '#B7A892',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    borderWidth: 1.5,
    borderColor: colors.dashed,
  },
  dayLabel: {
    fontSize: 13.5,
  },
});
