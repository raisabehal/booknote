/**
 * Booknote design tokens.
 *
 * Transcribed verbatim from the design handoff (README "Design Tokens" +
 * the prototype's embedded logic). Every hex, radius, font size and spacing
 * value the UI uses should originate here — screens should never hardcode a
 * color. The palette is a warm-paper aesthetic: terracotta accent on cream
 * cards over a warm-paper background, paired with Spectral (serif) + DM Sans.
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const colors = {
  /** Page background — warm paper. */
  background: '#EEE4D2',
  /** Cards, sheets, inputs-on-dark. */
  surface: '#FBF6EC',
  /** Text input fill. */
  inputFill: '#FFFFFF',

  /** Primary text — headings, body. */
  ink: '#3B2E25',
  /** A slightly softer ink used for emphasised body copy in the prototype. */
  inkSoft: '#5A4D42',
  /** Secondary text. */
  muted: '#8A7866',
  /** Tertiary labels (the prototype uses a few near-identical warm greys). */
  muted2: '#9A8A76',
  muted3: '#A99880',
  muted4: '#A0907B',
  /** Date-chip / "decide later" warm brown labels. */
  warmLabel: '#A0794A',

  /** Card / input borders, dividers. */
  border: '#E4D7C0',
  /** Inner dividers, date-chip background. */
  divider: '#EFE3CC',
  /** "Decide later" / empty-state dashed outlines. */
  dashed: '#CBB590',

  /** Primary accent — buttons, active tab, links, vote fill. */
  accent: '#BD5D38',
  /** Pressed / secondary accent. */
  accentDark: '#A6452A',
  accentDark2: '#A6533B',

  /** Confirmed / host accent, calendar selected day, "send poll". */
  green: '#5B7355',
  /** Stars, ratings, host/gold avatar. */
  gold: '#C99A2E',
  /** Voting-status pill text. */
  goldDark: '#9C6F1E',
  /** Member / book accent. */
  purple: '#7B6A9C',
  /** Member / book accent. */
  teal: '#4F7A82',

  /** Open-poll status pill background + border. */
  votePillBg: '#FBF0DD',
  votePillBorder: '#EAD6AE',

  /** Bookshelf base wood. */
  shelfWood: '#6E5645',

  /** Misc warm tones pulled straight from the prototype. */
  progressTrack: '#E7DAC2',
  avatarOverflowBg: '#E4D7C0',
  white: '#FFFFFF',
} as const;

// ---------------------------------------------------------------------------
// Member avatar colors (id -> color)
// These mirror the prototype's `this.M` map and are the source of truth for
// the seeded demo members. Real membership replaces this at the data layer.
// ---------------------------------------------------------------------------
export const memberColors = {
  you: '#BD5D38',
  maya: '#C99A2E',
  jordan: '#5B7355',
  aisha: '#7B6A9C',
  dev: '#4F7A82',
} as const;

// ---------------------------------------------------------------------------
// Genre colors (for the Shelf genre breakdown bars)
// ---------------------------------------------------------------------------
export const genreColors: Record<string, string> = {
  'Literary Fiction': '#5B7355',
  'Sci-Fi': '#355C7D',
  Nonfiction: '#BD5D38',
  Fantasy: '#A6533B',
  'Historical Fiction': '#B5773C',
  Satire: '#C99A2E',
  Mystery: '#6E5A48',
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
/**
 * Font family keys map to the names registered with expo-font in the root
 * layout. Spectral (serif) carries the wordmark, titles, numerals and book
 * spines; DM Sans (sans) carries all body text, labels, buttons and inputs.
 */
export const fonts = {
  serifRegular: 'Spectral_400Regular',
  serifMedium: 'Spectral_500Medium',
  serifSemiBold: 'Spectral_600SemiBold',
  serifBold: 'Spectral_700Bold',

  sansRegular: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
} as const;

/** A few canonical type ramps named in the README. Sizes are unitless dp. */
export const type = {
  /** Wordmark — Spectral 42 / 700, letter-spacing -0.01em. */
  wordmark: { fontFamily: fonts.serifBold, fontSize: 42, letterSpacing: -0.42 },
  /** "YOUR BOOK CLUB" tagline — DM Sans 11 / 600, +0.22em, uppercase. */
  tagline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 2.42,
    textTransform: 'uppercase' as const,
  },
  /** Screen titles — Spectral 27–30 / 600. */
  screenTitle: { fontFamily: fonts.serifSemiBold, fontSize: 27 },
  /** Card titles — Spectral ~15 / 600. */
  cardTitle: { fontFamily: fonts.serifSemiBold, fontSize: 15 },
  /** Section labels — DM Sans 11.5 / 700, +0.08em, uppercase, muted. */
  sectionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.92,
    textTransform: 'uppercase' as const,
    color: colors.muted,
  },
  /** Body — DM Sans 13–15. */
  body: { fontFamily: fonts.sansRegular, fontSize: 14 },
} as const;

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------
export const radius = {
  /** Inputs & small buttons. */
  input: 12,
  /** Cards (14–18). */
  card: 16,
  cardSm: 14,
  cardLg: 18,
  /** Pills. */
  pill: 99,
  /** Book spines (top corners only). */
  spine: 2,
} as const;

// ---------------------------------------------------------------------------
// Shadows (iOS shadow* + Android elevation)
// ---------------------------------------------------------------------------
export const shadows = {
  /** Card shadow: 0 6px 16px rgba(59,46,37,0.05–0.07). */
  card: {
    shadowColor: '#3B2E25',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  /** Heavier next-meeting card: 0 8px 22px rgba(59,46,37,0.09). */
  cardRaised: {
    shadowColor: '#3B2E25',
    shadowOpacity: 0.09,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing & layout
// ---------------------------------------------------------------------------
export const spacing = {
  /** Status-bar clearance at the top of full screens. */
  screenTop: 54,
  /** Default horizontal screen padding. */
  screenX: 20,
  /** Tab-bar bottom safe-area padding. */
  tabBarBottom: 26,
  /** Minimum tap target. */
  tapTarget: 44,
} as const;

// ---------------------------------------------------------------------------
// Animation timings (README "Animations")
// ---------------------------------------------------------------------------
export const motion = {
  /** Sheets slide up. */
  sheet: 260,
  /** Vote fill bars transition width. */
  voteBar: 350,
  /** Pressable press scale. */
  press: 120,
} as const;

export const theme = {
  colors,
  memberColors,
  genreColors,
  fonts,
  type,
  radius,
  shadows,
  spacing,
  motion,
};

export default theme;
