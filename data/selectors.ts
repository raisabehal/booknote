/**
 * Pure, derived views over the domain state. Everything the README flags as
 * "must derive from the live member list" is computed here — screens read these
 * instead of hardcoding counts, avatars, host lists or vote percentages.
 */

import { daysBetweenIso, relLabel, todayIso } from './format';
import type { BooknoteState, Candidate, Member, Poll } from './models';

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
