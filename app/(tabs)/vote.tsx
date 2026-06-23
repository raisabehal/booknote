import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PollCard } from '@/components/vote/poll-card';
import type { CandidateView } from '@/components/vote/candidate-row';
import { colors, fonts, spacing } from '@/constants/theme';
import { fmtDate } from '@/data/format';
import { memberById, pollStatusLabel, tallyPoll } from '@/data/selectors';
import { useBooknote } from '@/data/store';

export default function VoteScreen() {
  const insets = useSafeAreaInsets();
  const { state, now, actions } = useBooknote();
  const { suggest } = useLocalSearchParams<{ suggest?: string }>();

  // Which poll's add-option panel is open (one at a time), and its input text.
  const [suggestForPoll, setSuggestForPoll] = useState<string | null>(
    typeof suggest === 'string' ? suggest : null,
  );
  const [suggestText, setSuggestText] = useState('');

  // Open the panel when deep-linked from "put it to a vote".
  useEffect(() => {
    if (typeof suggest === 'string' && suggest) setSuggestForPoll(suggest);
  }, [suggest]);

  const toggleSuggest = (pollId: string) => {
    setSuggestForPoll((cur) => (cur === pollId ? null : pollId));
    setSuggestText('');
  };

  const submitSuggest = (pollId: string) => {
    if (!suggestText.trim()) return;
    actions.suggestCandidate(pollId, suggestText);
    setSuggestText('');
    setSuggestForPoll(null);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Votes</Text>
      <Text style={styles.subtitle}>Each poll picks the book for one meeting.</Text>

      {state.polls.length === 0 ? (
        <Text style={styles.empty}>
          No votes running. Start one from a meeting on the Home tab — choose &quot;Put it to a
          vote&quot; when you pick the book.
        </Text>
      ) : (
        <View style={styles.list}>
          {state.polls.map((poll) => {
            const f = fmtDate(poll.date, now);
            const host = memberById(state, poll.hostId);
            const tally = tallyPoll(poll);
            const candidates: CandidateView[] = tally.candidates.map((c) => ({
              id: c.id,
              title: c.title,
              author: c.author,
              color: c.color,
              pct: c.pct,
              votesLabel: `${c.votes} vote${c.votes === 1 ? '' : 's'}`,
              byLabel: c.isAppPick ? 'App pick' : `Suggested by ${memberById(state, c.suggestedBy)?.name ?? c.suggestedBy}`,
              voted: c.voted,
            }));

            return (
              <PollCard
                key={poll.id}
                weekday={f.weekday}
                day={f.day}
                month={f.month}
                dateLabel={f.label}
                host={host}
                isDraft={poll.status === 'draft'}
                statusLabel={pollStatusLabel(poll, now)}
                candidates={candidates}
                appPicks={state.appPicks}
                suggestOpen={suggestForPoll === poll.id}
                suggestText={suggestText}
                onSuggestText={setSuggestText}
                onToggleSuggest={() => toggleSuggest(poll.id)}
                onSubmitSuggest={() => submitSuggest(poll.id)}
                onAddAppPick={(p) => actions.addAppPick(poll.id, p)}
                onVote={(candidateId) => actions.castVote(poll.id, candidateId)}
                onSend={() => actions.sendPoll(poll.id)}
              />
            );
          })}
        </View>
      )}
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
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 27,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: colors.muted,
    marginBottom: 20,
  },
  list: {
    gap: 22,
  },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.warmLabel,
    lineHeight: 22,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
});
