import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { DateChip } from '@/components/ui/date-chip';
import { PlusIcon, SendIcon } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import type { AppPick, Member } from '@/data/models';
import { CandidateRow, type CandidateView } from './candidate-row';

export interface PollCardProps {
  weekday: string;
  day: string;
  month: string;
  dateLabel: string;
  host?: Member;
  isDraft: boolean;
  statusLabel: string;
  candidates: CandidateView[];
  appPicks: AppPick[];
  suggestOpen: boolean;
  suggestText: string;
  onSuggestText: (v: string) => void;
  onToggleSuggest: () => void;
  onSubmitSuggest: () => void;
  onAddAppPick: (p: AppPick) => void;
  onVote: (candidateId: string) => void;
  onSend: () => void;
}

export function PollCard(props: PollCardProps) {
  const { isDraft, candidates } = props;
  const status = isDraft
    ? { bg: colors.divider, border: '#D6C4A8', color: '#7a6a52' }
    : { bg: colors.votePillBg, border: colors.votePillBorder, color: colors.goldDark };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <DateChip weekday={props.weekday} day={props.day} month={props.month} width={46} height={52} />
        <View style={styles.headerText}>
          <Text style={styles.meetingTitle}>{props.dateLabel} meeting</Text>
          <View style={styles.hostRow}>
            {props.host ? <Avatar initials={props.host.initials} color={props.host.color} size={18} fontSize={8} /> : null}
            <Text style={styles.hostName}>Hosted by {props.host?.name ?? '—'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.statusPill, { backgroundColor: status.bg, borderColor: status.border }]}>
          <Text style={[styles.statusLabel, { color: status.color }]}>{props.statusLabel}</Text>
        </View>

        {candidates.length > 0 ? (
          <View style={styles.candidates}>
            {candidates.map((c) => (
              <CandidateRow key={c.id} candidate={c} onVote={() => props.onVote(c.id)} />
            ))}
          </View>
        ) : (
          <Text style={styles.noOptions}>
            No options yet — add a couple of books below, then send the poll to the club.
          </Text>
        )}

        {props.suggestOpen ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Add an option</Text>
            <TextField
              value={props.suggestText}
              onChangeText={props.onSuggestText}
              onSubmitEditing={props.onSubmitSuggest}
              placeholder="Book title…"
              containerStyle={styles.panelInput}
            />
            <View style={styles.panelButtons}>
              <PressableScale onPress={props.onSubmitSuggest} style={styles.addBtn}>
                <Text style={styles.addBtnLabel}>Add to poll</Text>
              </PressableScale>
              <PressableScale onPress={props.onToggleSuggest} style={styles.doneBtn}>
                <Text style={styles.doneBtnLabel}>Done</Text>
              </PressableScale>
            </View>
            <Text style={styles.appPickLabel}>Or add an app pick</Text>
            <View style={styles.appPicks}>
              {props.appPicks.map((p) => (
                <View key={p.id} style={styles.appPick}>
                  <View style={[styles.appPickCover, { backgroundColor: p.color }]} />
                  <View style={styles.appPickText}>
                    <Text style={styles.appPickTitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.appPickAuthor} numberOfLines={1}>
                      {p.author}
                    </Text>
                  </View>
                  <PressableScale onPress={() => props.onAddAppPick(p)} style={styles.appPickAdd}>
                    <Text style={styles.appPickAddLabel}>Add</Text>
                  </PressableScale>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <PressableScale onPress={props.onToggleSuggest} style={styles.addOption}>
            <PlusIcon size={13} color={colors.warmLabel} />
            <Text style={styles.addOptionLabel}>Add an option</Text>
          </PressableScale>
        )}

        {isDraft ? (
          <PressableScale onPress={props.onSend} style={styles.send}>
            <SendIcon size={16} color={colors.surface} />
            <Text style={styles.sendLabel}>Send poll to the club</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3B2E25',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerText: { flex: 1, minWidth: 0 },
  meetingTitle: { fontFamily: fonts.serifSemiBold, fontSize: 16, color: colors.ink, lineHeight: 18 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  hostName: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.muted },
  body: { padding: 15 },
  statusPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginBottom: 13,
  },
  statusLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
  candidates: { gap: 10 },
  noOptions: {
    textAlign: 'center',
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: colors.warmLabel,
    lineHeight: 19,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 13,
    marginTop: 11,
  },
  panelTitle: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.inkSoft, marginBottom: 9 },
  panelInput: { marginBottom: 9 },
  panelButtons: { flexDirection: 'row', gap: 9, marginBottom: 13 },
  addBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addBtnLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.white },
  doneBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  doneBtnLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.muted },
  appPickLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginBottom: 8,
  },
  appPicks: { gap: 8 },
  appPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 9,
    paddingHorizontal: 11,
  },
  appPickCover: {
    width: 32,
    height: 46,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  appPickText: { flex: 1, minWidth: 0 },
  appPickTitle: { fontFamily: fonts.serifSemiBold, fontSize: 13, color: colors.ink },
  appPickAuthor: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.muted },
  appPickAdd: { backgroundColor: colors.divider, borderRadius: 99, paddingVertical: 7, paddingHorizontal: 13 },
  appPickAddLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.goldDark },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.dashed,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 11,
  },
  addOptionLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.warmLabel },
  send: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 13,
  },
  sendLabel: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.surface },
});
