import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radius } from '@/constants/theme';
import { currentMember } from '@/data/selectors';
import { useBooknote } from '@/data/store';

/** Profile bottom sheet — avatar, name, email, and Sign out (which returns to
 *  the welcome screen via the auth gate, handy for replaying onboarding). */
export default function ProfileSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, actions } = useBooknote();
  const me = currentMember(state);

  const close = () => router.back();
  const signOut = async () => {
    await actions.signOut();
    // The route gate swaps to the onboarding flow once signed out.
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.grabber} />
        <View style={styles.identity}>
          <Avatar
            initials={me?.initials ?? 'YO'}
            color={me?.color ?? colors.accent}
            textColor={colors.surface}
            size={52}
            fontSize={18}
          />
          <View style={styles.identityText}>
            <Text style={styles.name}>{state.user?.name ?? 'You'}</Text>
            <Text style={styles.email}>{state.user?.email ?? 'you@email.com'}</Text>
          </View>
        </View>
        <PressableScale onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutLabel}>Sign out</Text>
        </PressableScale>
        <Text style={styles.helper}>
          Signing out returns to the welcome screen — handy for replaying the full first-run flow.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43,33,26,0.4)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: '#D6C4A8',
    alignSelf: 'center',
    marginBottom: 18,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 20,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 18,
    color: colors.ink,
  },
  email: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 1,
  },
  signOut: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: 'center',
  },
  signOutLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.accent,
  },
  helper: {
    textAlign: 'center',
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: colors.muted3,
    marginTop: 12,
  },
});
