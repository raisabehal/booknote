import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DietSelector } from '@/components/profile/diet-selector';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PasswordField } from '@/components/onboarding/password-field';
import { PrimaryButton } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { useBooknote } from '@/data/store';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { actions } = useBooknote();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    await actions.signUp({ name, email, password });
    // Account made — continue to choosing a path (not into the app yet).
    router.replace('/choose');
  };

  return (
    <OnboardingShell
      onBack={() => router.back()}
      title="Create your account"
      subtitle="Reading with your club in under a minute."
      footer={
        <>
          <PrimaryButton label="Create account" onPress={submit} />
          <Text style={styles.switch}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.replace('/sign-in')}>
              Sign in
            </Text>
          </Text>
        </>
      }>
      <View style={styles.fields}>
        <TextField
          label="Your name"
          placeholder="Jordan Patel"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextField
          label="Email"
          placeholder="you@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PasswordField
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
        />
        <View>
          <View style={styles.dietLabelRow}>
            <Text style={styles.dietLabel}>Dietary needs</Text>
            <Text style={styles.dietLabelSoft}> · so hosts can plan</Text>
          </View>
          <Text style={styles.dietHelp}>Pick any that apply — shared with whoever&apos;s hosting.</Text>
          <DietSelector />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 17,
  },
  dietLabelRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  dietLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  dietLabelSoft: { fontFamily: fonts.sansMedium, fontSize: 11.5, color: '#B7A892' },
  dietHelp: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.muted3, marginBottom: 10, lineHeight: 17 },
  switch: {
    textAlign: 'center',
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    color: colors.muted,
  },
  link: {
    fontFamily: fonts.sansBold,
    color: colors.accent,
  },
});
