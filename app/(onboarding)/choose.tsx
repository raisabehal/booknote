import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radius, shadows } from '@/constants/theme';

export default function ChooseScreen() {
  const router = useRouter();

  return (
    <OnboardingShell
      onBack={() => router.replace('/welcome')}
      title="You're all set"
      subtitle="How would you like to start?">
      <View style={styles.cards}>
        <OptionCard
          title="Join a club"
          description="Got an invite from a friend? Enter the code."
          iconBg="#EAD9C4"
          icon={
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <Circle cx={9} cy={7} r={4} />
              <Path d="M19 8v6M22 11h-6" />
            </Svg>
          }
          onPress={() => router.push('/join')}
        />
        <OptionCard
          title="Start a new club"
          description="Set it up and invite your friends."
          iconBg="#DCE5D3"
          icon={
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          }
          onPress={() => router.push('/create-club')}
        />
      </View>
    </OnboardingShell>
  );
}

function OptionCard({
  title,
  description,
  icon,
  iconBg,
  onPress,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  iconBg: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.card}>
      <View style={[styles.icon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardLg,
    padding: 20,
    ...shadows.card,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 17,
    color: colors.ink,
  },
  cardDesc: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 17,
  },
});
