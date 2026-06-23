import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PasswordField } from '@/components/onboarding/password-field';
import { PrimaryButton } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { useBooknote } from '@/data/store';

export default function SignInScreen() {
  const router = useRouter();
  const { actions } = useBooknote();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    // Entering the app — the route gate redirects to the tabs once authed.
    await actions.signIn({ email, password });
  };

  return (
    <OnboardingShell
      onBack={() => router.back()}
      title="Welcome back"
      subtitle="Pick up right where your club left off."
      footer={
        <>
          <PrimaryButton label="Sign in" onPress={submit} />
          <Text style={styles.switch}>
            New to Booknote?{' '}
            <Text style={styles.link} onPress={() => router.replace('/create-account')}>
              Create an account
            </Text>
          </Text>
        </>
      }>
      <View style={styles.fields}>
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
          labelAccessory={<Text style={styles.forgot}>Forgot?</Text>}
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 17,
  },
  forgot: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.accent,
  },
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
