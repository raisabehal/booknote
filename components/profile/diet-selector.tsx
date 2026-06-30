import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radius } from '@/constants/theme';
import { DIET_OPTIONS } from '@/data/models';
import { currentUserDiet } from '@/data/selectors';
import { useBooknote } from '@/data/store';

/**
 * The current user's dietary-restriction picker — preset chips plus a free-text
 * "Add another…". Shared by the sign-up screen and the Profile sheet; edits the
 * `you` member's diet immediately, so the host summary updates live.
 */
export function DietSelector() {
  const { state, actions } = useBooknote();
  const diet = currentUserDiet(state);
  const [other, setOther] = useState('');

  const custom = diet.filter((d) => !DIET_OPTIONS.includes(d as (typeof DIET_OPTIONS)[number]));

  const addOther = () => {
    actions.addCustomDiet(other);
    setOther('');
  };

  return (
    <View>
      <View style={styles.chips}>
        {DIET_OPTIONS.map((opt) => {
          const sel = diet.includes(opt);
          return (
            <PressableScale
              key={opt}
              onPress={() => actions.toggleDiet(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor: sel ? colors.green : colors.white,
                  borderColor: sel ? colors.green : colors.border,
                },
              ]}>
              <Text style={[styles.chipLabel, { color: sel ? colors.surface : colors.inkSoft }]}>{opt}</Text>
            </PressableScale>
          );
        })}
        {custom.map((c) => (
          <PressableScale key={c} onPress={() => actions.toggleDiet(c)} style={[styles.chip, styles.customChip]}>
            <Text style={[styles.chipLabel, { color: colors.surface }]}>{c}</Text>
            <Text style={styles.removeX}>×</Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={other}
          onChangeText={setOther}
          onSubmitEditing={addOther}
          placeholder="Add another…"
          placeholderTextColor={colors.muted3}
          style={styles.input}
          autoCapitalize="words"
          returnKeyType="done"
        />
        <PressableScale onPress={addOther} style={styles.addBtn}>
          <Text style={styles.addLabel}>Add</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  customChip: { backgroundColor: colors.green, borderColor: colors.green },
  chipLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13 },
  removeX: { color: colors.surface, opacity: 0.75, fontSize: 15, lineHeight: 15 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 9 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.ink,
  },
  addBtn: {
    backgroundColor: colors.divider,
    borderRadius: radius.pill,
    paddingHorizontal: 17,
    justifyContent: 'center',
  },
  addLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.goldDark },
});
