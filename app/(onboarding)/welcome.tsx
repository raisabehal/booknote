import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShelfMark } from '@/components/brand/shelf-mark';
import { PrimaryButton, TextButton } from '@/components/ui/button';
import { colors, fonts } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28 },
      ]}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <ShelfMark />
        </View>
        <Text style={styles.wordmark}>Booknote</Text>
        <Text style={styles.tagline}>Your book club</Text>
        <Text style={styles.subtitle}>
          Your book club&apos;s next read, meeting, and conversation — all in one place.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Create an account" onPress={() => router.push('/create-account')} />
        <TextButton label="I already have an account" onPress={() => router.push('/sign-in')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 30,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    marginBottom: 38,
  },
  wordmark: {
    fontFamily: fonts.serifBold,
    fontSize: 42,
    letterSpacing: -0.42,
    color: colors.ink,
    lineHeight: 46,
  },
  tagline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: 'uppercase',
    color: colors.accent,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 250,
  },
  actions: {
    gap: 11,
  },
});
