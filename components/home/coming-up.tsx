import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { DateChip } from '@/components/ui/date-chip';
import { PlusIcon } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';

/** Book-status pill style for one upcoming meeting. */
export interface BookPill {
  label: string;
  dotColor: string;
  textColor: string;
  borderColor: string;
  dashed: boolean;
}

export interface UpcomingRow {
  id: string;
  weekday: string;
  day: string;
  month: string;
  hostInitials: string;
  hostColor: string;
  hostLabel: string;
  timeLabel: string;
  pill: BookPill;
  onPress: () => void;
}

export interface ComingUpProps {
  rows: UpcomingRow[];
  onPlanMeeting: () => void;
}

export function ComingUp({ rows, onPlanMeeting }: ComingUpProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>Coming up</Text>
        <PressableScale onPress={onPlanMeeting} style={styles.plan}>
          <PlusIcon size={12} color={colors.accent} />
          <Text style={styles.planLabel}>Plan a meeting</Text>
        </PressableScale>
      </View>

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map((r) => (
            <PressableScale key={r.id} onPress={r.onPress} style={styles.row}>
              <DateChip weekday={r.weekday} day={r.day} month={r.month} />
              <View style={styles.rowMain}>
                <View style={styles.rowTop}>
                  <Avatar initials={r.hostInitials} color={r.hostColor} size={21} fontSize={9} />
                  <Text style={styles.hostLabel} numberOfLines={1}>
                    {r.hostLabel}
                  </Text>
                  <Text style={styles.time}>{r.timeLabel}</Text>
                </View>
                <View
                  style={[
                    styles.pill,
                    {
                      borderColor: r.pill.borderColor,
                      borderStyle: r.pill.dashed ? 'dashed' : 'solid',
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: r.pill.dotColor }]} />
                  <Text style={[styles.pillLabel, { color: r.pill.textColor }]} numberOfLines={1}>
                    {r.pill.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </PressableScale>
          ))}
        </View>
      ) : (
        <PressableScale onPress={onPlanMeeting} style={styles.empty}>
          <View style={styles.emptyIcon}>
            <PlusIcon size={17} color={colors.warmLabel} />
          </View>
          <Text style={styles.emptyText}>
            Nothing on the calendar yet — plan your next meeting and pick the book later.
          </Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 2,
    paddingBottom: 10,
  },
  heading: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: colors.accent,
  },
  list: {
    gap: 9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  hostLabel: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: colors.muted,
  },
  time: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.inkSoft,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
    maxWidth: '100%',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pillLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    flexShrink: 1,
  },
  chevron: {
    fontFamily: fonts.sansRegular,
    fontSize: 18,
    color: '#C3B091',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1.5,
    borderColor: colors.dashed,
    borderStyle: 'dashed',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  emptyIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.warmLabel,
    lineHeight: 18,
  },
});
