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

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { formatChatTime } from '@/data/format';
import { REACTION_EMOJIS } from '@/data/models';
import { currentBook, memberById, memberCount } from '@/data/selectors';
import { useBooknote } from '@/data/store';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { state, now, actions } = useBooknote();
  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState('');

  const reading = currentBook(state);
  const myId = state.user?.id ?? 'you';

  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: true });

  const send = () => {
    if (!text.trim()) return;
    actions.sendMessage(text);
    setText('');
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
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Group chat</Text>
          <Text style={styles.headerMeta}>
            Discussing {reading?.title ?? '—'} · {memberCount(state)} members
          </Text>
        </View>

        <View style={styles.messages}>
          {state.messages.map((m) => {
            const author = memberById(state, m.authorId);
            const mine = m.authorId === myId;
            return (
              <View key={m.id} style={[styles.messageRow, mine ? styles.rowReverse : null]}>
                <Avatar
                  initials={author?.initials ?? '??'}
                  color={author?.color ?? colors.muted}
                  size={30}
                  fontSize={10}
                />
                <View style={[styles.bubbleCol, { alignItems: mine ? 'flex-end' : 'flex-start' }]}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{author?.name ?? 'Member'}</Text>
                    <Text style={styles.time}>{formatChatTime(m.createdAt, now)}</Text>
                  </View>
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
                    <Text style={[styles.bubbleText, { color: mine ? colors.surface : colors.ink }]}>
                      {m.text}
                    </Text>
                  </View>
                  <View style={styles.reactions}>
                    {REACTION_EMOJIS.map((emoji) => {
                      const isMine = !!m.myReactions[emoji];
                      const count = (m.reactions[emoji] ?? 0) + (isMine ? 1 : 0);
                      return (
                        <PressableScale
                          key={emoji}
                          onPress={() => actions.toggleReaction(m.id, emoji)}
                          style={[
                            styles.reaction,
                            {
                              backgroundColor: isMine ? '#F6E4DB' : colors.white,
                              borderColor: isMine ? '#D9A88E' : colors.border,
                            },
                          ]}>
                          <Text style={styles.reactionEmoji}>{emoji}</Text>
                          {count > 0 ? <Text style={styles.reactionCount}>{count}</Text> : null}
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
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
    </KeyboardAvoidingView>
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
  bubbleCol: { maxWidth: '75%' },
  nameRow: { flexDirection: 'row', gap: 7, alignItems: 'baseline', marginBottom: 3 },
  name: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.inkSoft },
  time: { fontFamily: fonts.sansRegular, fontSize: 9.5, color: colors.muted4 },
  bubble: { paddingVertical: 10, paddingHorizontal: 13 },
  bubbleMine: { backgroundColor: colors.accent },
  bubbleOther: { backgroundColor: colors.surface },
  bubbleText: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 19 },
  reactions: { flexDirection: 'row', gap: 6, marginTop: 6 },
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
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
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
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: colors.white, fontSize: 18, fontFamily: fonts.sansBold },
});
