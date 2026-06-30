import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { formatChatTime } from '@/data/format';
import { EMOJI_POOL, type Message } from '@/data/models';
import { currentBook, memberById, memberCount } from '@/data/selectors';
import { useBooknote } from '@/data/store';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { state, now, actions } = useBooknote();
  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState('');
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const reading = currentBook(state);
  const myId = state.user?.id ?? 'you';
  const replyParent = replyingTo ? state.messages.find((m) => m.id === replyingTo) : null;
  const replyParentName = replyParent ? memberById(state, replyParent.authorId)?.name ?? 'Member' : '';

  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: true });

  const send = () => {
    if (!text.trim()) return;
    actions.sendMessage(text, replyingTo);
    setText('');
    setReplyingTo(null);
    requestAnimationFrame(scrollToEnd);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 88, default: 0 })}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        onContentSizeChange={scrollToEnd}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Group chat</Text>
          <Text style={styles.headerMeta}>
            Discussing {reading?.title ?? '—'} · {memberCount(state)} members
          </Text>
        </View>

        <View style={styles.messages}>
          {state.messages.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              mine={m.authorId === myId}
              author={memberById(state, m.authorId)}
              replyName={m.replyTo ? memberById(state, m.replyTo.authorId)?.name ?? 'Member' : ''}
              now={now}
              pickerOpen={pickerFor === m.id}
              onTogglePicker={() => setPickerFor((cur) => (cur === m.id ? null : m.id))}
              onReact={(emoji) => {
                actions.toggleReaction(m.id, emoji);
                setPickerFor(null);
              }}
              onReply={() => setReplyingTo(m.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.composerWrap, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
        {replyParent ? (
          <View style={styles.replyBanner}>
            <View style={styles.replyBar} />
            <View style={styles.replyBannerText}>
              <Text style={styles.replyBannerName}>Replying to {replyParentName}</Text>
              <Text style={styles.replyBannerSnippet} numberOfLines={1}>
                {replyParent.text}
              </Text>
            </View>
            <PressableScale onPress={() => setReplyingTo(null)} style={styles.replyCancel} hitSlop={6}>
              <Text style={styles.replyCancelLabel}>✕</Text>
            </PressableScale>
          </View>
        ) : null}
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            placeholder="Message the club…"
            placeholderTextColor={colors.muted3}
            style={styles.input}
            returnKeyType="send"
          />
          <PressableScale onPress={send} style={styles.send}>
            <Text style={styles.sendIcon}>↑</Text>
          </PressableScale>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageRow({
  message,
  mine,
  author,
  replyName,
  now,
  pickerOpen,
  onTogglePicker,
  onReact,
  onReply,
}: {
  message: Message;
  mine: boolean;
  author?: { initials: string; color: string; name: string };
  replyName: string;
  now: Date;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
}) {
  // Only show emojis that have a count or that the user reacted with.
  const emojis = [
    ...new Set([
      ...Object.keys(message.reactions).filter((e) => (message.reactions[e] ?? 0) > 0),
      ...Object.keys(message.myReactions).filter((e) => message.myReactions[e]),
    ]),
  ];

  return (
    <View style={[styles.messageRow, mine ? styles.rowReverse : null]}>
      <Avatar initials={author?.initials ?? '??'} color={author?.color ?? colors.muted} size={30} fontSize={10} />
      <View style={[styles.bubbleCol, { alignItems: mine ? 'flex-end' : 'flex-start' }]}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{author?.name ?? 'Member'}</Text>
          <Text style={styles.time}>{formatChatTime(message.createdAt, now)}</Text>
        </View>

        {message.replyTo ? (
          <View style={[styles.quoted, { borderLeftColor: mine ? 'rgba(255,255,255,0.5)' : '#D9C7A8' }]}>
            <Text style={[styles.quotedName, { color: mine ? 'rgba(255,255,255,0.85)' : colors.muted }]}>{replyName}</Text>
            <Text style={[styles.quotedText, { color: mine ? 'rgba(255,255,255,0.85)' : colors.muted }]} numberOfLines={1}>
              {message.replyTo.text}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMine : styles.bubbleOther,
            {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: mine ? 16 : 4,
              borderBottomRightRadius: mine ? 4 : 16,
            },
          ]}>
          <Text style={[styles.bubbleText, { color: mine ? colors.surface : colors.ink }]}>{message.text}</Text>
        </View>

        <View style={styles.actionRow}>
          {emojis.map((emoji) => {
            const isMine = !!message.myReactions[emoji];
            const count = (message.reactions[emoji] ?? 0) + (isMine ? 1 : 0);
            return (
              <PressableScale
                key={emoji}
                onPress={() => onReact(emoji)}
                style={[styles.reaction, { backgroundColor: isMine ? '#F6E4DB' : colors.white, borderColor: isMine ? '#D9A88E' : colors.border }]}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 0 ? <Text style={styles.reactionCount}>{count}</Text> : null}
              </PressableScale>
            );
          })}
          <PressableScale onPress={onTogglePicker} style={styles.iconBtn}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.muted4} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx={12} cy={12} r={9} />
              <Path d="M9 10h.01M15 10h.01M8.5 14.5a4 4 0 0 0 7 0" />
            </Svg>
          </PressableScale>
          <PressableScale onPress={onReply} style={styles.replyBtn}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.muted4} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M9 17l-5-5 5-5" />
              <Path d="M4 12h11a4 4 0 0 1 4 4v2" />
            </Svg>
            <Text style={styles.replyBtnLabel}>Reply</Text>
          </PressableScale>
        </View>

        {pickerOpen ? (
          <View style={styles.picker}>
            {EMOJI_POOL.map((e) => (
              <PressableScale key={e} onPress={() => onReact(e)} style={styles.pickerItem}>
                <Text style={styles.pickerEmoji}>{e}</Text>
              </PressableScale>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 14 },
  header: { alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.ink },
  headerMeta: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.muted2, marginTop: 2 },
  messages: { gap: 14 },
  messageRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  rowReverse: { flexDirection: 'row-reverse' },
  bubbleCol: { maxWidth: '78%' },
  nameRow: { flexDirection: 'row', gap: 7, alignItems: 'baseline', marginBottom: 3 },
  name: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.inkSoft },
  time: { fontFamily: fonts.sansRegular, fontSize: 9.5, color: colors.muted4 },
  quoted: { borderLeftWidth: 2, paddingLeft: 8, paddingVertical: 1, marginBottom: 4, maxWidth: '100%' },
  quotedName: { fontFamily: fonts.sansBold, fontSize: 10 },
  quotedText: { fontFamily: fonts.sansRegular, fontSize: 11, maxWidth: 200 },
  bubble: { paddingVertical: 10, paddingHorizontal: 13 },
  bubbleMine: { backgroundColor: colors.accent },
  bubbleOther: { backgroundColor: colors.surface },
  bubbleText: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 19 },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  reactionEmoji: { fontSize: 11 },
  reactionCount: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.inkSoft },
  iconBtn: {
    width: 25,
    height: 22,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  replyBtnLabel: { fontFamily: fonts.sansSemiBold, fontSize: 10.5, color: colors.muted4 },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 7,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 8,
    maxWidth: 236,
    ...{
      shadowColor: '#3B2E25',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
  },
  pickerItem: { padding: 3, borderRadius: 8 },
  pickerEmoji: { fontSize: 20, lineHeight: 24 },
  composerWrap: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 8,
    paddingHorizontal: 10,
    marginBottom: 9,
  },
  replyBar: { width: 3, alignSelf: 'stretch', backgroundColor: colors.accent, borderRadius: 9 },
  replyBannerText: { flex: 1, minWidth: 0 },
  replyBannerName: { fontFamily: fonts.sansBold, fontSize: 10.5, color: colors.accent },
  replyBannerSnippet: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.muted },
  replyCancel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyCancelLabel: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingVertical: 11,
    paddingHorizontal: 16,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: colors.ink,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: colors.white, fontSize: 18, fontFamily: fonts.sansBold },
});
