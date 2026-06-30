/**
 * Pure, derived views over the domain state. Everything the README flags as
 * "must derive from the live member list" is computed here — screens read these
 * instead of hardcoding counts, avatars, host lists or vote percentages.
 */

import { colors, genreColors } from '@/constants/theme';

import { addDaysIso, daysBetweenIso, relLabel, todayIso } from './format';
import type { Book, BooknoteState, Candidate, Member, Poll, Topic } from './models';

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export function memberById(state: BooknoteState, id: string): Member | undefined {
  return state.members.find((m) => m.id === id);
}

/** The signed-in user's own member record. */
export function currentMember(state: BooknoteState): Member | undefined {
  return state.members.find((m) => m.isCurrentUser) ?? memberById(state, state.user?.id ?? 'you');
}

export function memberCount(state: BooknoteState): number {
  return state.members.length;
}

/** "11 members · Chapel Hill, NC" — derived, never stored. */
export function clubMeta(state: BooknoteState): string {
  const n = memberCount(state);
  const people = `${n} member${n === 1 ? '' : 's'}`;
  return state.club.location ? `${people} · ${state.club.location}` : people;
}

/** Host picker options — every member can host. */
export function hostOptions(state: BooknoteState): Member[] {
  return state.members;
}

export interface AvatarStack {
  /** The first `max` members to render as avatars. */
  shown: Member[];
  /** How many more aren't shown (the "+N" chip), 0 if none. */
  overflow: number;
}

/** Slice a member list into a render-able avatar stack with overflow count. */
export function avatarStack(members: Member[], max: number): AvatarStack {
  return {
    shown: members.slice(0, max),
    overflow: Math.max(0, members.length - max),
  };
}

// ---------------------------------------------------------------------------
// Meeting progress ("Where everyone's at")
// ---------------------------------------------------------------------------

export interface MeetingProgress {
  finished: number;
  total: number;
  /** 0–1 fraction for the progress bar. */
  fraction: number;
  /** Member records who have finished, in roster order. */
  finishedMembers: Member[];
}

export function meetingProgress(state: BooknoteState): MeetingProgress {
  const me = currentUserId(state);
  const finishedSet = new Set(state.meeting.finishedMemberIds);
  // Layer the current user in/out based on their own reading status.
  if (state.readingStatus === 'finished') finishedSet.add(me);
  else finishedSet.delete(me);
  const finishedMembers = state.members.filter((m) => finishedSet.has(m.id));
  const total = state.members.length;
  return {
    finished: finishedMembers.length,
    total,
    fraction: total ? finishedMembers.length / total : 0,
    finishedMembers,
  };
}

// ---------------------------------------------------------------------------
// RSVP / attendees / dietary needs
// ---------------------------------------------------------------------------

export function currentUserId(state: BooknoteState): string {
  return state.user?.id ?? 'you';
}

/** Whether the current user has RSVP'd to the next meeting. */
export function isGoing(state: BooknoteState): boolean {
  return state.meeting.going.includes(currentUserId(state));
}

/** Members who've RSVP'd "going" to the next meeting, in roster order. */
export function goingMembers(state: BooknoteState): Member[] {
  const set = new Set(state.meeting.going);
  return state.members.filter((m) => set.has(m.id));
}

export interface DietRow {
  label: string;
  count: number;
  /** Comma-joined names of who has this restriction. */
  who: string;
}

/** The host's dietary-needs view: one row per restriction across everyone
 *  going, plus the live "N going" count. */
export function dietarySummary(state: BooknoteState): { going: number; rows: DietRow[] } {
  const going = goingMembers(state);
  const map: Record<string, string[]> = {};
  for (const m of going) for (const d of m.diet) (map[d] = map[d] ?? []).push(m.name);
  const rows = Object.keys(map)
    .sort((a, b) => map[b].length - map[a].length)
    .map((label) => ({ label, count: map[label].length, who: map[label].join(', ') }));
  return { going: going.length, rows };
}

/** The current user's dietary restrictions. */
export function currentUserDiet(state: BooknoteState): string[] {
  return memberById(state, currentUserId(state))?.diet ?? [];
}

// ---------------------------------------------------------------------------
// Discussion topics & photos (keyed by book id)
// ---------------------------------------------------------------------------

export function topicsFor(state: BooknoteState, bookId: string): Topic[] {
  return state.topics[bookId] ?? [];
}

export function photosFor(state: BooknoteState, bookId: string): string[] {
  return state.photos[bookId] ?? [];
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

export function bookById(state: BooknoteState, id: string | null | undefined) {
  return id ? state.books.find((b) => b.id === id) : undefined;
}

/** The book currently being read for the next meeting. */
export function currentBook(state: BooknoteState) {
  return bookById(state, state.meeting.bookId);
}

// ---------------------------------------------------------------------------
// Polls / live voting
// ---------------------------------------------------------------------------

export interface TalliedCandidate extends Candidate {
  /** Vote count including the current user's optimistic vote. */
  votes: number;
  /** Whole-number percentage of the live total. */
  pct: number;
  /** Whether this is the current user's current pick. */
  voted: boolean;
}

export interface PollTally {
  total: number;
  /** Candidates sorted by live vote count, descending. */
  candidates: TalliedCandidate[];
}

/**
 * Live tally for a poll. The current user's vote is layered on optimistically
 * (so percentages recompute the instant they tap), and candidates are ranked by
 * the resulting count — exactly the prototype's behaviour.
 */
export function tallyPoll(poll: Poll): PollTally {
  const votesOf = (c: Candidate) => c.baseVotes + (poll.myVote === c.id ? 1 : 0);
  const total = poll.candidates.reduce((sum, c) => sum + votesOf(c), 0);
  const candidates: TalliedCandidate[] = poll.candidates
    .map((c) => {
      const votes = votesOf(c);
      return {
        ...c,
        votes,
        pct: total ? Math.round((votes / total) * 100) : 0,
        voted: poll.myVote === c.id,
      };
    })
    .sort((a, b) => b.votes - a.votes);
  return { total, candidates };
}

/** "Closes in 3 days · 11 votes" / "Draft — not sent to the club yet". */
export function pollStatusLabel(poll: Poll, now: Date): string {
  if (poll.status === 'draft') return 'Draft — not sent to the club yet';
  const total = tallyPoll(poll).total;
  const days = daysBetweenIso(todayIso(now), poll.closesDate);
  const votes = `${total} vote${total === 1 ? '' : 's'}`;
  return `Closes ${relLabel(days)} · ${votes}`;
}

/** The poll linked to an upcoming meeting whose book is "put to a vote". */
export function pollForMeeting(state: BooknoteState, meetingId: string): Poll | undefined {
  return state.polls.find((p) => p.id === meetingId);
}

// ---------------------------------------------------------------------------
// Book detail — individual scores & meeting-night recap
// ---------------------------------------------------------------------------

export interface MemberScore {
  name: string;
  initials: string;
  color: string;
  /** Star rating 0–5. */
  score: number;
}

/**
 * Per-member scores for a book's "Individual scores" panel. The current user's
 * is their real `myRating`; the rest are derived deterministically around the
 * club average (a stand-in for stored per-member ratings).
 */
export function memberScores(state: BooknoteState, book: Book): MemberScore[] {
  const seed = book.id.charCodeAt(0) + book.id.length;
  const reviewers = ['maya', 'jordan', 'aisha', 'dev'];
  const offsets = [1, 0, -1, 0, 1];
  const rows: MemberScore[] = [];
  if (book.myRating > 0) {
    const me = memberById(state, currentUserId(state));
    rows.push({ name: 'You', initials: me?.initials ?? 'YO', color: me?.color ?? colors.accent, score: book.myRating });
  }
  reviewers.forEach((key, i) => {
    const m = memberById(state, key);
    if (!m) return;
    let sc = Math.round((book.clubRating ?? 4) + offsets[(i + seed) % offsets.length]);
    sc = Math.max(2, Math.min(5, sc));
    rows.push({ name: m.name, initials: m.initials, color: m.color, score: sc });
  });
  return rows;
}

export interface RecapAttendees {
  members: { name: string; initials: string; color: string }[];
  countLabel: string;
  moreLabel: string;
}

/** Attendees shown in a read book's "Meeting night" recap. */
export function recapAttendees(state: BooknoteState, book: Book): RecapAttendees {
  const seed = book.id.charCodeAt(0) + book.id.length;
  const keys = ['you', 'maya', 'jordan', 'aisha', 'dev'];
  const members = keys
    .map((k) => memberById(state, k))
    .filter((m): m is Member => !!m)
    .map((m) => ({ name: m.name, initials: m.initials, color: m.color }));
  const total = 8 + (seed % 3);
  const more = total - members.length;
  return {
    members,
    countLabel: `${total} of ${state.members.length}`,
    moreLabel: more > 0 ? `+${more} more` : '',
  };
}

// ---------------------------------------------------------------------------
// Shelf
// ---------------------------------------------------------------------------

/** Books the club has finished, newest first (seed order is already newest-first). */
export function readBooks(state: BooknoteState): Book[] {
  return state.books.filter((b) => b.status === 'read');
}

export interface ShelfStats {
  count: number;
  /** Average club rating across read books, to one decimal (e.g. "4.3"). */
  avg: string;
  genres: number;
}

export function shelfStats(state: BooknoteState): ShelfStats {
  const read = readBooks(state);
  const rated = read.filter((b) => b.clubRating != null);
  const avg = rated.length
    ? (rated.reduce((sum, b) => sum + (b.clubRating ?? 0), 0) / rated.length).toFixed(1)
    : '—';
  const genres = new Set(read.map((b) => b.genre)).size;
  return { count: read.length, avg, genres };
}

export interface GenreBar {
  name: string;
  count: number;
  /** 0–100 width relative to the most-read genre. */
  pct: number;
  color: string;
}

/** Genre breakdown bars, most-read first. */
export function genreBreakdown(state: BooknoteState): GenreBar[] {
  const counts: Record<string, number> = {};
  for (const b of readBooks(state)) counts[b.genre] = (counts[b.genre] ?? 0) + 1;
  const max = Math.max(1, ...Object.values(counts));
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .map((name) => ({
      name,
      count: counts[name],
      pct: Math.round((counts[name] / max) * 100),
      color: genreColors[name] ?? colors.accent,
    }));
}

/** A sensible default date for a brand-new meeting: two weeks after the latest
 *  meeting already on the books (ISO yyyy-mm-dd sorts lexically). */
export function defaultNextMeetingDate(state: BooknoteState, now: Date): string {
  const latest = [state.meeting.date, ...state.upcoming.map((u) => u.date)].reduce(
    (a, b) => (a > b ? a : b),
    todayIso(now),
  );
  return addDaysIso(latest, 14);
}
