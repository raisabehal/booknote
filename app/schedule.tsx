import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';

/**
 * Placeholder for the Schedule-meeting sheet (full month calendar, time pills,
 * book picker, host picker). The real flow arrives in milestone 5; this stub
 * exists so Home's Edit / Plan / row-edit navigations resolve.
 */
export default function ScheduleSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string; id?: string }>();

  const title =
    mode === 'next' ? 'Edit next meeting' : mode === 'edit' ? 'Edit meeting' : 'Schedule a meeting';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <PressableScale onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeLabel}>✕</Text>
        </PressableScale>
      </View>
      <View style={styles.body}>
        <Text style={styles.note}>The schedule sheet — calendar, time, book picker and host picker — lands in milestone 5.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 21,
    color: colors.ink,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.muted,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  note: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
  },
});
