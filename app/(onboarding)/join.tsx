import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { Avatar } from '@/components/ui/avatar';
import { PrimaryButton } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts, radius, shadows } from '@/constants/theme';
import { avatarStack, clubMeta, currentBook } from '@/data/selectors';
import { useBooknote } from '@/data/store';

export default function JoinScreen() {
  const router = useRouter();
  const { state, actions } = useBooknote();
  // Pre-fill the demo invite code so the live preview shows on arrival.
  const [code, setCode] = useState(state.club.inviteCode);

  const valid = code.trim().length >= 3;
  const book = currentBook(state);
  // The invite previews the club you'd be joining — show its existing members.
  const others = state.members.filter((m) => !m.isCurrentUser);
  const stack = avatarStack(others, 2);

  return (
    <OnboardingShell
      onBack={() => router.back()}
      title="Join a club"
      subtitle="Enter the invite code a member shared with you."
      footer={
        valid ? <PrimaryButton label={`Join ${state.club.name}`} onPress={() => actions.joinClub(code)} /> : undefined
      }>
      <TextField
        label="Invite code"
        value={code}
        onChangeText={setCode}
        placeholder="e.g. RR-2K26"
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.codeInput}
      />

      {valid ? (
        <View style={styles.preview}>
          <View style={styles.previewBar} />
          <View style={styles.previewBody}>
            <Text style={styles.foundLabel}>Invite found</Text>
            <Text style={styles.clubName}>{state.club.name}</Text>
            <Text style={styles.clubMeta}>{clubMeta(state)}</Text>

            <View style={styles.readingRow}>
              <View style={[styles.miniCover, { backgroundColor: book?.color ?? colors.green }]} />
              <View style={styles.readingText}>
                <Text style={styles.readingLabel}>Currently reading</Text>
                <Text style={styles.readingTitle}>{book?.title ?? '—'}</Text>
              </View>
              <View style={styles.stack}>
                {stack.shown.map((m, i) => (
                  <Avatar
                    key={m.id}
                    initials={m.initials}
                    color={m.color}
                    size={26}
                    ring
                    style={i > 0 ? styles.stacked : undefined}
                  />
                ))}
                {stack.overflow > 0 ? (
                  <Avatar
                    initials={`+${stack.overflow}`}
                    color={colors.avatarOverflowBg}
                    textColor={colors.muted}
                    size={26}
                    ring
                    fontSize={9}
                    style={styles.stacked}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  codeInput: {
    textAlign: 'center',
    fontFamily: fonts.serifBold,
    fontSize: 19,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    paddingVertical: 16,
  },
  preview: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    ...shadows.cardRaised,
  },
  previewBar: {
    height: 6,
    backgroundColor: colors.green,
  },
  previewBody: {
    padding: 18,
  },
  foundLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.95,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginBottom: 6,
  },
  clubName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 22,
    color: colors.ink,
    lineHeight: 24,
  },
  clubMeta: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  miniCover: {
    width: 34,
    height: 50,
    borderRadius: 4,
    ...shadows.card,
  },
  readingText: {
    flex: 1,
    minWidth: 0,
  },
  readingLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    letterSpacing: 0.74,
    textTransform: 'uppercase',
    color: colors.muted2,
  },
  readingTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 14,
    color: colors.ink,
    marginTop: 1,
  },
  stack: {
    flexDirection: 'row',
  },
  stacked: {
    marginLeft: -7,
  },
});
