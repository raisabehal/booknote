import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { BookCover } from '@/components/book/book-cover';
import { CollapsibleSection } from '@/components/home/collapsible-section';
import { PhotoAlbum } from '@/components/photo/photo-album';
import { Avatar } from '@/components/ui/avatar';
import { AvatarStack } from '@/components/ui/avatar-stack';
import { PencilIcon } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radius, shadows } from '@/constants/theme';
import { fmtDate } from '@/data/format';
import { READING_STATUSES } from '@/data/models';
import {
  currentBook,
  dietarySummary,
  isGoing,
  meetingProgress,
  memberById,
  photosFor,
  topicsFor,
} from '@/data/selectors';
import { useBooknote } from '@/data/store';

export interface NextMeetingCardProps {
  onEdit: () => void;
  onDiscuss: () => void;
  onOpenBook: () => void;
}

export function NextMeetingCard({ onEdit, onDiscuss, onOpenBook }: NextMeetingCardProps) {
  const { state, now, actions } = useBooknote();
  const [topicDraft, setTopicDraft] = useState('');

  const book = currentBook(state);
  const bookId = state.meeting.bookId ?? '';
  const host = memberById(state, state.meeting.hostId);
  const next = fmtDate(state.meeting.date, now);
  const daysUntil = next.days;
  const daysLabel = daysUntil <= 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;

  const progress = meetingProgress(state);
  const going = isGoing(state);
  const diet = dietarySummary(state);
  const topics = topicsFor(state, bookId);
  const photos = photosFor(state, bookId);

  const submitTopic = () => {
    actions.addTopic(bookId, topicDraft);
    setTopicDraft('');
  };

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
              <MetaRow label="When" value={`${next.label} · ${state.meeting.time}`} />
              <MetaRow label="Where" value={state.meeting.place || 'TBD'} />
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
            onPress={actions.toggleRsvp}
            style={[styles.rsvp, { backgroundColor: going ? colors.green : colors.accent }]}>
            <Text style={styles.rsvpLabel}>{going ? "✓ You're going" : "I'll be there"}</Text>
          </PressableScale>
          <PressableScale onPress={onDiscuss} style={styles.discuss}>
            <Text style={styles.discussLabel}>Discuss</Text>
          </PressableScale>
        </View>

        {/* Where everyone's at + your reading status (always visible) */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionLabel}>Where everyone&apos;s at</Text>
            <Text style={styles.progressCount}>
              {progress.finished} of {progress.total} finished
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress.fraction * 100)}%` }]} />
          </View>
          <AvatarStack members={progress.finishedMembers} max={4} size={26} style={styles.progressAvatars} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabelText}>Your status</Text>
            {READING_STATUSES.map((rs) => {
              const sel = state.readingStatus === rs.key;
              return (
                <PressableScale
                  key={rs.key}
                  onPress={() => actions.setReadingStatus(rs.key)}
                  style={[
                    styles.statusPill,
                    { backgroundColor: sel ? colors.green : colors.white, borderColor: sel ? colors.green : colors.border },
                  ]}>
                  <Text style={[styles.statusPillLabel, { color: sel ? colors.surface : colors.inkSoft }]}>{rs.label}</Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Dietary needs */}
        <CollapsibleSection
          icon={<UserIcon />}
          label="Dietary needs"
          teaser={`${diet.going} going`}>
          {diet.rows.length > 0 ? (
            <View style={styles.dietList}>
              {diet.rows.map((r) => (
                <View key={r.label} style={styles.dietRow}>
                  <View style={styles.dietBadge}>
                    <Text style={styles.dietBadgeText}>{r.count}</Text>
                  </View>
                  <Text style={styles.dietLabel}>{r.label}</Text>
                  <Text style={styles.dietWho} numberOfLines={1}>
                    {r.who}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNote}>No restrictions noted from those going.</Text>
          )}
        </CollapsibleSection>

        {/* Discussion topics */}
        <CollapsibleSection
          icon={<ChatIcon />}
          label="Discussion topics"
          teaser={topics.length ? `${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}` : 'Add topics'}>
          <View style={styles.topicList}>
            {topics.map((t) => {
              const by = t.authorId ? memberById(state, t.authorId)?.name : '';
              return (
                <View key={t.id} style={styles.topicRow}>
                  <Text style={styles.qBadge}>Q</Text>
                  <View style={styles.topicTextWrap}>
                    <Text style={styles.topicText}>{t.text}</Text>
                    {by ? <Text style={styles.topicBy}>Suggested by {by}</Text> : null}
                  </View>
                </View>
              );
            })}
            <View style={styles.topicAddRow}>
              <TextInput
                value={topicDraft}
                onChangeText={setTopicDraft}
                onSubmitEditing={submitTopic}
                placeholder="Suggest a question…"
                placeholderTextColor={colors.muted3}
                style={styles.topicInput}
                returnKeyType="done"
              />
              <PressableScale onPress={submitTopic} style={styles.topicAddBtn}>
                <Text style={styles.topicAddLabel}>Add</Text>
              </PressableScale>
            </View>
          </View>
        </CollapsibleSection>

        {/* Meetup photos */}
        <CollapsibleSection icon={<PhotoIcon />} label="Meetup photos" teaser="Group pics">
          <Text style={styles.albumIntro}>Add your group photos from when you meet</Text>
          <PhotoAlbum
            photos={photos}
            onAdd={(uri) => actions.addPhoto(bookId, uri)}
            onRemove={(i) => actions.removePhoto(bookId, i)}
            size={104}
          />
        </CollapsibleSection>
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

function UserIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}
function ChatIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}
function PhotoIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={3} width={18} height={18} rx={2} />
      <Circle cx={9} cy={9} r={2} />
      <Path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20" />
    </Svg>
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
  barRight: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  barDays: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.surface, opacity: 0.85 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 7,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  editLabel: { fontFamily: fonts.sansSemiBold, fontSize: 10, letterSpacing: 0.8, color: colors.surface },
  body: { padding: 16 },
  bookRow: { flexDirection: 'row', gap: 15, alignItems: 'flex-start' },
  bookInfo: { flex: 1, minWidth: 0 },
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
  metaRows: { gap: 7 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaLabel: { width: 44, fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted2 },
  metaValue: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  buttons: { flexDirection: 'row', gap: 9, marginTop: 15 },
  rsvp: { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  rsvpLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.white },
  discuss: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discussLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12.5, color: colors.muted },

  progressSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 13 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    letterSpacing: 0.95,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  progressCount: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.muted4 },
  track: { height: 7, borderRadius: radius.pill, backgroundColor: colors.progressTrack, overflow: 'hidden', marginBottom: 11 },
  fill: { height: '100%', backgroundColor: colors.green },
  progressAvatars: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  statusLabelText: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.muted, marginRight: 1 },
  statusPill: { borderWidth: 1.5, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  statusPillLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11.5 },

  dietList: { gap: 8 },
  dietRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dietBadge: { width: 19, height: 19, borderRadius: 10, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  dietBadgeText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.white },
  dietLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12.5, color: colors.inkSoft },
  dietWho: { flex: 1, textAlign: 'right', fontFamily: fonts.sansRegular, fontSize: 11, color: colors.muted4 },
  emptyNote: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted4, lineHeight: 17 },

  topicList: { gap: 8 },
  topicRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  qBadge: { fontFamily: fonts.serifBold, fontSize: 13, color: colors.accent, lineHeight: 17 },
  topicTextWrap: { flex: 1, minWidth: 0 },
  topicText: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.ink, lineHeight: 17 },
  topicBy: { fontFamily: fonts.sansRegular, fontSize: 10.5, color: colors.muted4, marginTop: 3 },
  topicAddRow: { flexDirection: 'row', gap: 8 },
  topicInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.ink,
  },
  topicAddBtn: { backgroundColor: colors.divider, borderRadius: radius.pill, paddingHorizontal: 16, justifyContent: 'center' },
  topicAddLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.goldDark },

  albumIntro: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.muted, marginBottom: 10 },
});
