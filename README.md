# Booknote

A mobile book-club app: one club's next meeting, upcoming schedule, book-selection
votes, shelf of past reads, and group chat in one place.

Built from the design handoff (`Booknote.dc.html` prototype + spec) — recreated
natively, not ported. Warm-paper aesthetic: terracotta accent on cream cards,
Spectral (serif) + DM Sans paired throughout.

## Stack

- **Expo** (SDK 54) + **React Native** + **TypeScript**
- **Expo Router** — file-based navigation (`app/`)
- **react-native-reanimated** — sheet slide-ups & vote-bar width transitions
- **react-native-svg** — inline icons (tab bar, etc.)
- Fonts: **Spectral** + **DM Sans** via `@expo-google-fonts`
- Styling is custom (no component kit) — every token lives in `constants/theme.ts`

The data layer (next milestone) is local-first behind clean interfaces, so auth,
persistence and notifications can be swapped for a real backend later.

## Run it

```bash
npm install
npx expo start        # then press i / a, or scan the QR with Expo Go
```

Other checks:

```bash
npx tsc --noEmit      # typecheck
npx expo lint         # lint
```

## Project layout

```
app/
  _layout.tsx          # root: loads fonts, splash, Stack
  (tabs)/
    _layout.tsx        # tab navigator — Home / Shelf / Vote / Chat
    index.tsx          # Home
    shelf.tsx          # Shelf
    vote.tsx           # Vote
    chat.tsx           # Chat
components/
  tab-bar-icon.tsx     # custom SVG tab glyphs (match prototype)
  haptic-tab.tsx       # press haptics on tabs
  screen-placeholder.tsx
constants/
  theme.ts             # ALL design tokens (colors, fonts, radii, shadows, motion)
```

## Milestones

1. **Scaffold** — Expo + TS + Router, fonts loaded, `theme.ts`, tab shell ✅
2. **Data layer** — typed models + seeded "Rhythm Readers" demo club ✅
3. **Onboarding** — welcome → account → join/create (mock auth behind an interface) ✅
4. **Home tab** — next-meeting card, progress, coming-up, bookshelf ✅
5. Schedule sheet (calendar, book picker, host picker)
6. Vote tab (per-meeting polls)
7. Shelf, Chat, Book detail, Profile sheet
