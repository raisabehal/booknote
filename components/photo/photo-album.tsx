import { Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';

export interface PhotoAlbumProps {
  photos: string[];
  onAdd: (dataUri: string) => void;
  onRemove: (index: number) => void;
  /** Square slot size (104 on Home, 96 in the book recap). */
  size?: number;
}

/** Horizontal album of group photos. On web a slot opens the file picker and
 *  the image is downscaled before storing; on native it's a placeholder until a
 *  real camera/library uploader is wired. */
export function PhotoAlbum({ photos, onAdd, onRemove, size = 104 }: PhotoAlbumProps) {
  const pick = () => {
    if (Platform.OS === 'web') {
      pickImageWeb(onAdd);
    } else {
      Alert.alert('Add a photo', 'Photo upload is available in the web demo and the native app build.');
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {photos.map((uri, i) => (
        <View key={i} style={[styles.slot, { width: size, height: size }]}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          <PressableScale onPress={() => onRemove(i)} style={styles.remove} hitSlop={6}>
            <Text style={styles.removeLabel}>×</Text>
          </PressableScale>
        </View>
      ))}
      <PressableScale onPress={pick} style={[styles.addSlot, { width: size, height: size }]}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.warmLabel} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={13} r={3.2} />
          <Path d="M3 9a2 2 0 0 1 2-2h1.5l1-1.6A1 1 0 0 1 8.4 5h7.2a1 1 0 0 1 .9.4l1 1.6H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </Svg>
        <Text style={styles.addLabel}>{photos.length ? 'Add' : 'Add group photo'}</Text>
      </PressableScale>
    </ScrollView>
  );
}

/** Open a file picker, read + downscale the chosen image to a JPEG data URI. */
function pickImageWeb(onResult: (dataUri: string) => void) {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc) return;
  const input = doc.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => downscale(String(reader.result), 900, 0.72).then(onResult);
    reader.readAsDataURL(file);
  };
  input.click();
}

function downscale(dataUri: string, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const ImageCtor = (globalThis as { Image?: typeof HTMLImageElement }).Image;
    const doc = (globalThis as { document?: Document }).document;
    if (!ImageCtor || !doc) return resolve(dataUri);
    const img = new ImageCtor();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = doc.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUri);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
}

const styles = StyleSheet.create({
  row: { gap: 9, paddingBottom: 2 },
  slot: { borderRadius: 13, overflow: 'hidden', position: 'relative', backgroundColor: colors.divider },
  image: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(43,33,26,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: { color: colors.white, fontSize: 15, lineHeight: 16, fontFamily: fonts.sansMedium },
  addSlot: {
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.dashed,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  addLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.warmLabel, textAlign: 'center' },
});
