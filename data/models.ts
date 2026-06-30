/**
 * Booknote domain models.
 *
 * These mirror the README "State Management" section and the prototype's
 * embedded state shape. They describe *domain* data only — ephemeral UI state
 * (active tab, open sheets, draft form values, composer text) lives in the
 * screens/components, not here. The whole tree is serialisable so it can be
 * persisted locally today and swapped for a backend later.
 */

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

/** A club member. Avatar colour + initials live here so every stacked-avatar
 *  row, the host picker and the progress denominator derive from this list. */
export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  /** Dietary restrictions (preset + custom) — surfaced to hosts for planning. */
  diet: string[];
  /** True for the signed-in user's own member record (id `you`). */
  isCurrentUser?: boolean;
}

/** The authenticated account. `id` maps onto a {@link Member} once joined. */
export interface User {
  id: string;
  name: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Club
// ---------------------------------------------------------------------------

/** Club identity. The "11 members · Chapel Hill, NC" meta line is *derived*
 *  from the live member list + location — never stored as a string. */
export interface Club {
  name: string;
  location: string;
  inviteCode: string;
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

export type BookStatus = 'reading' | 'read';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  /** Cover / spine fill colour. */
  color: string;
  /** Spine label text colour (covers are dark). */
  textColor: string;
  status: BookStatus;
  /** Club average rating, or null while unrated. */
  clubRating: number | null;
  /** The current user's rating, 0 = unrated. */
  myRating: number;
  /** Display label for when it was discussed, e.g. "Apr 2026" or "Jun 25". */
  date: string;
  blurb: string;
}

/** A book the app can suggest into a poll without a member championing it. */
export interface AppPick {
  id: string;
  title: string;
  author: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

/**
 * How a meeting's book is chosen. Mirrors the prototype's
 * `book: string | null | '__vote__'` but as an explicit, backend-friendly
 * discriminated union.
 *  - `decided` — a confirmed title
 *  - `later`   — undecided ("decide later")
 *  - `vote`    — put to a club vote, linked to a poll (pollId === meeting id)
 */
export type BookSelection =
  | { kind: 'decided'; title: string }
  | { kind: 'later' }
  | { kind: 'vote'; pollId: string };

/** The club's immediate next meeting (the one the Home card highlights). */
export interface Meeting {
  date: string; // ISO yyyy-mm-dd
  time: string;
  place: string;
  hostId: string;
  /** The book currently being read/discussed for this meeting. */
  bookId: string | null;
  /** Member ids who have finished the current book — drives "X of N finished". */
  finishedMemberIds: string[];
  /** Member ids who have RSVP'd "going" — drives the attendee count and the
   *  host's dietary-needs summary. */
  going: string[];
}

/** Reading progress for the current book. */
export type ReadingStatus = 'not-started' | 'reading' | 'finished';

/** A discussion question for a meeting/book. */
export interface Topic {
  id: string;
  text: string;
  /** Member id of who suggested it ('' for seeded/recap topics). */
  authorId: string;
}

/** A scheduled upcoming meeting beyond the immediate next one. */
export interface UpcomingMeeting {
  id: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  hostId: string;
  place: string;
  book: BookSelection;
}

// ---------------------------------------------------------------------------
// Polls / voting
// ---------------------------------------------------------------------------

export type PollStatus = 'draft' | 'open';

export interface Candidate {
  id: string;
  title: string;
  author: string;
  /** Member id of who suggested it, or `app` for an app pick. */
  suggestedBy: string;
  /** Base vote tally from other members — excludes the current user's vote,
   *  which is layered on optimistically from {@link Poll.myVote}. */
  baseVotes: number;
  color: string;
  isAppPick: boolean;
}

/** One poll picks the book for one meeting (`id` === that meeting's id). */
export interface Poll {
  id: string;
  meetingId: string;
  date: string; // ISO yyyy-mm-dd, matches the meeting
  hostId: string;
  status: PollStatus;
  /** ISO date the poll closes; "closes in N days" is derived against the clock. */
  closesDate: string;
  /** The current user's single vote, or null. */
  myVote: string | null;
  candidates: Candidate[];
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface Message {
  id: string;
  authorId: string;
  text: string;
  /** Epoch ms — display label ("Mon 9:14", "Just now") is derived. */
  createdAt: number;
  /** Emoji -> base reaction count from other members. */
  reactions: Record<string, number>;
  /** Emoji -> whether the current user has reacted (layered on optimistically). */
  myReactions: Record<string, boolean>;
  /** The message this one replies to (quoted in the bubble), if any. */
  replyTo?: { authorId: string; text: string } | null;
}

// ---------------------------------------------------------------------------
// Root domain state
// ---------------------------------------------------------------------------

/** The complete, serialisable domain tree for one club. */
export interface BooknoteState {
  user: User | null;
  club: Club;
  members: Member[];
  /** The immediate next meeting. */
  meeting: Meeting;
  /** Further scheduled meetings. */
  upcoming: UpcomingMeeting[];
  polls: Poll[];
  books: Book[];
  messages: Message[];
  appPicks: AppPick[];
  /** Discussion topics keyed by book id (the meeting maps to its book). */
  topics: Record<string, Topic[]>;
  /** Meetup-album photo data URIs keyed by book id. */
  photos: Record<string, string[]>;
  /** The current user's reading status for the current book. */
  readingStatus: ReadingStatus;
}

/** Preset dietary-restriction options offered as chips. */
export const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free'] as const;

/** Emoji palette offered in the chat reaction picker. */
export const EMOJI_POOL = ['❤️', '😂', '😮', '👍', '🔥', '😢', '🎉', '📚', '🙌', '😍', '🤔', '💯'] as const;

/** The three reading-status options, in display order. */
export const READING_STATUSES: { key: ReadingStatus; label: string }[] = [
  { key: 'not-started', label: 'Not started' },
  { key: 'reading', label: 'Reading' },
  { key: 'finished', label: 'Finished' },
];
