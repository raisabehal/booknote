/**
 * Pure, derived views over the domain state. Everything the README flags as
 * "must derive from the live member list" is computed here — screens read these
 * instead of hardcoding counts, avatars, host lists or vote percentages.
 */

import { colors, genreColors } from '@/constants/theme';

import { addDaysIso, daysBetweenIso, relLabel, todayIso } from './format';
import type { Book, BooknoteState, Candidate, Member, Poll } from './models';

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
  const finishedSet = new Set(state.meeting.finishedMemberIds);
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
