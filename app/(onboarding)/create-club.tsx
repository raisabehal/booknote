import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PrimaryButton } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { useBooknote } from '@/data/store';

export default function CreateClubScreen() {
  const router = useRouter();
  const { actions } = useBooknote();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [firstBook, setFirstBook] = useState('');

  const submit = () => actions.createClub({ name, location, firstBook });

  return (
    <OnboardingShell
      onBack={() => router.back()}
      title="Create your club"
      subtitle="You can change any of this later."
      footer={
        <>
          <PrimaryButton label="Create club" onPress={submit} />
          <Text style={styles.helper}>You&apos;ll get a shareable invite code next.</Text>
        </>
      }>
      <View style={styles.fields}>
        <TextField
          label="Club name"
          placeholder="e.g. Thursday Night Readers"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextField
          label="Where you meet"
          placeholder="City or neighborhood"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
        />
        <TextField
          label="First book"
          labelAccessory={<Text style={styles.optional}>· optional</Text>}
          placeholder="What are you reading first?"
          value={firstBook}
          onChangeText={setFirstBook}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 17,
  },
  helper: {
    textAlign: 'center',
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.muted3,
  },
  optional: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#B7A892',
  },
});
