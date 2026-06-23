import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export interface BookCoverProps {
  title: string;
  author?: string;
  color: string;
  textColor?: string;
  width: number;
  height: number;
  /** Spectral title size; defaults scale with the cover. */
  titleSize?: number;
  padding?: number;
  /** Show the author in small caps at the foot of the cover. */
  showAuthor?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** A book cover/spine tile: solid colour, Spectral title, optional small-caps
 *  author, with the warm drop shadow used throughout. */
export function BookCover({
  title,
  author,
  color,
  textColor = colors.white,
  width,
  height,
  titleSize,
  padding,
  showAuthor = false,
  radius = 5,
  style,
}: BookCoverProps) {
  const pad = padding ?? Math.max(6, Math.round(width * 0.14));
  const tSize = titleSize ?? Math.max(8, Math.round(width * 0.17));

  return (
    <View
      style={[
        styles.cover,
        {
          width,
          height,
          padding: pad,
          backgroundColor: color,
          borderRadius: radius,
          justifyContent: showAuthor ? 'space-between' : 'flex-start',
        },
        style,
      ]}>
      <Text style={[styles.title, { color: textColor, fontSize: tSize, lineHeight: tSize * 1.12 }]} numberOfLines={5}>
        {title}
      </Text>
      {showAuthor && author ? (
        <Text style={[styles.author, { color: textColor }]} numberOfLines={1}>
          {author.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
  },
  author: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 7.5,
    letterSpacing: 0.5,
    opacity: 0.85,
  },
});
