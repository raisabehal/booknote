/**
 * The Booknote data store: a pure reducer over {@link BooknoteState} wrapped in
 * a React context provider that owns id/timestamp generation, notifier
 * side-effects, local persistence and the session clock.
 *
 * Screens consume `useBooknote()` (or the focused `useBooknoteState` /
 * `useBooknoteActions` hooks) and never touch persistence/auth/notifications
 * directly — those stay behind the interfaces in this folder so a real backend
 * can be dropped in later.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { addDaysIso, todayIso } from './format';
import type {
  AppPick,
  BooknoteState,
  BookSelection,
  Candidate,
  Message,
  Topic,
  UpcomingMeeting,
  User,
} from './models';
import { defaultAuth, type AuthProvider, type SignInInput, type SignUpInput } from './auth';
import { defaultNotifier, type Notifier } from './notifications';
import { defaultPersistence, type PersistenceAdapter } from './persistence';
import { buildSeed } from './seed';

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'HYDRATE'; state: BooknoteState }
  | { type: 'RESET'; state: BooknoteState }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'RATE_BOOK'; bookId: string; star: number }
  | { type: 'TOGGLE_RSVP' }
  | { type: 'SET_MEMBER_DIET'; memberId: string; diet: string[] }
  | { type: 'SET_READING_STATUS'; status: BooknoteState['readingStatus'] }
  | { type: 'ADD_TOPIC'; bookId: string; topic: Topic }
  | { type: 'ADD_PHOTO'; bookId: string; uri: string }
  | { type: 'REMOVE_PHOTO'; bookId: string; index: number }
  | { type: 'CAST_VOTE'; pollId: string; candidateId: string }
  | { type: 'TOGGLE_REACTION'; messageId: string; emoji: string }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'ADD_CANDIDATE'; pollId: string; candidate: Candidate; autoVote: boolean }
  | { type: 'SEND_POLL'; pollId: string }
  | { type: 'SET_NEXT_MEETING'; date: string; time: string; place: string; hostId: string }
  | { type: 'ADD_UPCOMING'; meeting: UpcomingMeeting; poll?: BooknoteState['polls'][number] }
  | { type: 'UPDATE_UPCOMING'; meeting: UpcomingMeeting; poll?: BooknoteState['polls'][number] }
  | { type: 'REMOVE_UPCOMING'; id: string };

/** The current user's member id (the seeded account maps onto `you`). */
function currentUserId(state: BooknoteState): string {
  return state.user?.id ?? 'you';
}

// ---------------------------------------------------------------------------
// Reducer (pure)
// ---------------------------------------------------------------------------

export function reducer(state: BooknoteState, action: Action): BooknoteState {
  switch (action.type) {
    case 'HYDRATE':
    case 'RESET':
      return action.state;

    case 'SET_USER':
      return { ...state, user: action.user };

    case 'RATE_BOOK':
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.bookId
            ? { ...b, myRating: b.myRating === action.star ? 0 : action.star }
            : b,
        ),
      };

    case 'TOGGLE_RSVP': {
      const me = currentUserId(state);
      const going = state.meeting.going.includes(me)
        ? state.meeting.going.filter((id) => id !== me)
        : [...state.meeting.going, me];
      return { ...state, meeting: { ...state.meeting, going } };
    }

    case 'SET_MEMBER_DIET':
      return {
        ...state,
        members: state.members.map((m) =>
          m.id === action.memberId ? { ...m, diet: action.diet } : m,
        ),
      };

    case 'SET_READING_STATUS':
      return { ...state, readingStatus: action.status };

    case 'ADD_TOPIC':
      return {
        ...state,
        topics: {
          ...state.topics,
          [action.bookId]: [...(state.topics[action.bookId] ?? []), action.topic],
        },
      };

    case 'ADD_PHOTO':
      return {
        ...state,
        photos: {
          ...state.photos,
          [action.bookId]: [...(state.photos[action.bookId] ?? []), action.uri],
        },
      };

    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: {
          ...state.photos,
          [action.bookId]: (state.photos[action.bookId] ?? []).filter((_, i) => i !== action.index),
        },
      };

    case 'CAST_VOTE':
      return {
        ...state,
        polls: state.polls.map((p) =>
          p.id === action.pollId
            ? { ...p, myVote: p.myVote === action.candidateId ? null : action.candidateId }
            : p,
        ),
      };

    case 'TOGGLE_REACTION':
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.id !== action.messageId) return m;
          const myReactions = { ...m.myReactions, [action.emoji]: !m.myReactions[action.emoji] };
          return { ...m, myReactions };
        }),
      };

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };

    case 'ADD_CANDIDATE':
      return {
        ...state,
        polls: state.polls.map((p) =>
          p.id === action.pollId
            ? {
                ...p,
                candidates: [...p.candidates, action.candidate],
                myVote: action.autoVote ? action.candidate.id : p.myVote,
              }
            : p,
        ),
      };

    case 'SEND_POLL':
      return {
        ...state,
        polls: state.polls.map((p) =>
          p.id === action.pollId ? { ...p, status: 'open' } : p,
        ),
      };

    case 'SET_NEXT_MEETING':
      return {
        ...state,
        meeting: {
          ...state.meeting,
          date: action.date,
          time: action.time,
          place: action.place,
          hostId: action.hostId,
        },
      };

    case 'ADD_UPCOMING':
      return {
        ...state,
        upcoming: [...state.upcoming, action.meeting],
        polls: action.poll ? [...state.polls, action.poll] : state.polls,
      };

    case 'UPDATE_UPCOMING':
      return {
        ...state,
        upcoming: state.upcoming.map((u) => (u.id === action.meeting.id ? action.meeting : u)),
        polls:
          action.poll && !state.polls.some((p) => p.id === action.poll!.id)
            ? [...state.polls, action.poll]
            : state.polls,
      };

    case 'REMOVE_UPCOMING':
      return {
        ...state,
        upcoming: state.upcoming.filter((u) => u.id !== action.id),
        polls: state.polls.filter((p) => p.id !== action.id),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Provider plumbing
// ---------------------------------------------------------------------------

let idCounter = 0;
/** Monotonic, collision-resistant id (timestamp + counter). */
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** A form draft handed to {@link BooknoteActions.saveMeeting}. */
export interface MeetingDraft {
  date: string;
  time: string;
  place: string;
  hostId: string;
  /** Ignored when scheduleMode is `next` (the next meeting keeps its book). */
  book: BookSelection;
}

export type ScheduleMode = 'next' | 'add' | 'editUpcoming';

export interface SaveMeetingResult {
  /** Set when this save created a draft poll, so the caller can deep-link to
   *  the Vote tab with the add-option panel open. */
  votePollId: string | null;
}

export interface BooknoteActions {
  rateBook(bookId: string, star: number): void;
  toggleRsvp(): void;
  /** Toggle one of the current user's dietary restrictions. */
  toggleDiet(option: string): void;
  /** Add a custom (free-text) dietary restriction for the current user. */
  addCustomDiet(text: string): void;
  /** Set the current user's reading status for the current book. */
  setReadingStatus(status: BooknoteState['readingStatus']): void;
  /** Add a discussion topic to a book's meeting. */
  addTopic(bookId: string, text: string): void;
  /** Append a photo (data URI) to a book's meetup album. */
  addPhoto(bookId: string, uri: string): void;
  /** Remove a photo from a book's album by index. */
  removePhoto(bookId: string, index: number): void;
  castVote(pollId: string, candidateId: string): void;
  toggleReaction(messageId: string, emoji: string): void;
  /** Append a chat message from the current user, optionally replying to one. */
  sendMessage(text: string, replyToId?: string | null): string | null;
  /** Suggest a member's book into a poll and auto-select it as the user's vote. */
  suggestCandidate(pollId: string, title: string): void;
  /** Add an app pick to a poll without casting a vote. */
  addAppPick(pollId: string, pick: AppPick): void;
  /** Flip a draft poll to open and notify the club. */
  sendPoll(pollId: string): void;
  /** Create/update a meeting (next | add | editUpcoming), wiring up a draft
   *  poll when the book is "put to a vote". */
  saveMeeting(draft: MeetingDraft, mode: ScheduleMode, editId?: string): SaveMeetingResult;
  removeUpcoming(id: string): void;

  // --- onboarding / session ---
  /** Create an account. Sets the profile but does NOT enter the app — the flow
   *  continues to "choose a path". */
  signUp(input: SignUpInput): Promise<void>;
  /** Sign in and enter the app. */
  signIn(input: SignInInput): Promise<void>;
  /** Redeem an invite code and enter the app. Lands in the seeded demo club. */
  joinClub(code: string): Promise<void>;
  /** Create a club and enter the app. Lands in the seeded demo club for now
   *  (real empty-club creation is deferred per the handoff). */
  createClub(input: { name: string; location: string; firstBook: string }): Promise<void>;
  /** Sign out and return to the welcome screen. */
  signOut(): Promise<void>;
}

export interface BooknoteContextValue {
  state: BooknoteState;
  /** Session clock — captured once at mount so labels stay stable. */
  now: Date;
  /** True once any persisted state has been loaded (or confirmed absent). */
  hydrated: boolean;
  /** Whether the user has entered the app (vs. the onboarding flow). Sourced
   *  from the auth provider, not the persisted domain state. */
  authed: boolean;
  actions: BooknoteActions;
  auth: AuthProvider;
  notifier: Notifier;
}

const BooknoteContext = createContext<BooknoteContextValue | null>(null);

export interface BooknoteProviderProps {
  children: ReactNode;
  /** Override the clock (tests / demos). Defaults to the real current date. */
  now?: Date;
  persistence?: PersistenceAdapter;
  auth?: AuthProvider;
  notifier?: Notifier;
  /** Override the initial state (tests). Defaults to the seeded demo club. */
  initialState?: BooknoteState;
}

export function BooknoteProvider({
  children,
  now,
  persistence = defaultPersistence,
  auth = defaultAuth,
  notifier = defaultNotifier,
  initialState,
}: BooknoteProviderProps) {
  // The clock is fixed for the session so relative labels don't drift mid-use.
  const clock = useMemo(() => now ?? new Date(), [now]);

  // Seed synchronously so screens always have data; persisted state (if any)
  // is loaded right after and replaces it.
  const [state, setState] = useState<BooknoteState>(
    () => initialState ?? buildSeed(clock),
  );
  const [hydrated, setHydrated] = useState(false);

  // Session flag — whether the user has entered the app. Lives outside the
  // persisted domain state; sourced from the auth provider on mount (the mock
  // starts signed-out, so the app opens on the onboarding flow).
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    let active = true;
    auth.getCurrentUser().then((user) => {
      if (active && user) setAuthed(true);
    });
    return () => {
      active = false;
    };
  }, [auth]);

  // `dispatch` runs the pure reducer against the latest state.
  const stateRef = useRef(state);
  stateRef.current = state;
  const dispatch = useCallback((action: Action) => {
    setState((prev) => reducer(prev, action));
  }, []);

  // Hydrate from local persistence once.
  useEffect(() => {
    let active = true;
    persistence
      .load()
      .then((loaded) => {
        if (active && loaded) setState(loaded);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [persistence]);

  // Persist on change once hydrated (debounced).
  useEffect(() => {
    if (!hydrated) return;
    const handle = setTimeout(() => {
      void persistence.save(state);
    }, 250);
    return () => clearTimeout(handle);
  }, [state, hydrated, persistence]);

  const actions = useMemo<BooknoteActions>(() => {
    const defaultCloses = () => addDaysIso(todayIso(clock), 5);

    return {
      rateBook: (bookId, star) => dispatch({ type: 'RATE_BOOK', bookId, star }),
      toggleRsvp: () => dispatch({ type: 'TOGGLE_RSVP' }),
      castVote: (pollId, candidateId) => dispatch({ type: 'CAST_VOTE', pollId, candidateId }),
      toggleReaction: (messageId, emoji) => dispatch({ type: 'TOGGLE_REACTION', messageId, emoji }),

      toggleDiet: (option) => {
        const me = stateRef.current.user?.id ?? 'you';
        const member = stateRef.current.members.find((m) => m.id === me);
        const current = member?.diet ?? [];
        const diet = current.includes(option)
          ? current.filter((d) => d !== option)
          : [...current, option];
        dispatch({ type: 'SET_MEMBER_DIET', memberId: me, diet });
      },

      addCustomDiet: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const me = stateRef.current.user?.id ?? 'you';
        const member = stateRef.current.members.find((m) => m.id === me);
        const current = member?.diet ?? [];
        if (current.includes(trimmed)) return;
        dispatch({ type: 'SET_MEMBER_DIET', memberId: me, diet: [...current, trimmed] });
      },

      setReadingStatus: (status) => dispatch({ type: 'SET_READING_STATUS', status }),

      addTopic: (bookId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        dispatch({
          type: 'ADD_TOPIC',
          bookId,
          topic: { id: uid('topic'), text: trimmed, authorId: stateRef.current.user?.id ?? 'you' },
        });
      },

      addPhoto: (bookId, uri) => dispatch({ type: 'ADD_PHOTO', bookId, uri }),
      removePhoto: (bookId, index) => dispatch({ type: 'REMOVE_PHOTO', bookId, index }),

      sendMessage: (text, replyToId) => {
        const trimmed = text.trim();
        if (!trimmed) return null;
        const id = uid('msg');
        const parent = replyToId
          ? stateRef.current.messages.find((m) => m.id === replyToId)
          : null;
        dispatch({
          type: 'ADD_MESSAGE',
          message: {
            id,
            authorId: stateRef.current.user?.id ?? 'you',
            text: trimmed,
            createdAt: Date.now(),
            reactions: {},
            myReactions: {},
            replyTo: parent ? { authorId: parent.authorId, text: parent.text } : null,
          },
        });
        return id;
      },

      suggestCandidate: (pollId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const candidate: Candidate = {
          id: uid('cand'),
          title: trimmed,
          author: 'Your suggestion',
          suggestedBy: stateRef.current.user?.id ?? 'you',
          baseVotes: 0,
          color: '#9C5C6E',
          isAppPick: false,
        };
        dispatch({ type: 'ADD_CANDIDATE', pollId, candidate, autoVote: true });
      },

      addAppPick: (pollId, pick) => {
        const candidate: Candidate = {
          id: uid('cand'),
          title: pick.title,
          author: pick.author,
          suggestedBy: 'app',
          baseVotes: 0,
          color: pick.color,
          isAppPick: true,
        };
        dispatch({ type: 'ADD_CANDIDATE', pollId, candidate, autoVote: false });
      },

      sendPoll: (pollId) => {
        dispatch({ type: 'SEND_POLL', pollId });
        const poll = stateRef.current.polls.find((p) => p.id === pollId);
        if (poll) notifier.pollSent({ ...poll, status: 'open' });
      },

      saveMeeting: (draft, mode, editId): SaveMeetingResult => {
        if (mode === 'next') {
          dispatch({
            type: 'SET_NEXT_MEETING',
            date: draft.date,
            time: draft.time,
            place: draft.place,
            hostId: draft.hostId,
          });
          notifier.meetingChanged({ ...stateRef.current.meeting, ...draft });
          return { votePollId: null };
        }

        const isAdd = mode === 'add';
        const id = isAdd ? uid('mtg') : (editId as string);

        // Normalise the book selection; a vote selection links to a poll with
        // this meeting's id.
        let book: BookSelection = draft.book;
        if (book.kind === 'vote') book = { kind: 'vote', pollId: id };

        const meeting: UpcomingMeeting = {
          id,
          date: draft.date,
          time: draft.time,
          hostId: draft.hostId,
          place: draft.place,
          book,
        };

        // Create a draft poll the first time a meeting is put to a vote.
        const needsPoll =
          book.kind === 'vote' && !stateRef.current.polls.some((p) => p.id === id);
        const poll = needsPoll
          ? {
              id,
              meetingId: id,
              date: draft.date,
              hostId: draft.hostId,
              status: 'draft' as const,
              closesDate: defaultCloses(),
              myVote: null,
              candidates: [],
            }
          : undefined;

        if (isAdd) {
          dispatch({ type: 'ADD_UPCOMING', meeting, poll });
          notifier.meetingScheduled(meeting);
        } else {
          dispatch({ type: 'UPDATE_UPCOMING', meeting, poll });
          notifier.meetingChanged(meeting);
        }

        return { votePollId: book.kind === 'vote' ? id : null };
      },

      removeUpcoming: (id) => dispatch({ type: 'REMOVE_UPCOMING', id }),

      signUp: async (input) => {
        const user = await auth.signUp(input);
        dispatch({ type: 'SET_USER', user });
      },

      signIn: async (input) => {
        const user = await auth.signIn(input);
        dispatch({ type: 'SET_USER', user });
        setAuthed(true);
      },

      joinClub: async () => {
        // Lands in the seeded demo club; real invite redemption comes later.
        setAuthed(true);
      },

      createClub: async () => {
        // Lands in the seeded demo club; real empty-club creation comes later.
        setAuthed(true);
      },

      signOut: async () => {
        await auth.signOut();
        dispatch({ type: 'SET_USER', user: null });
        setAuthed(false);
      },
    };
  }, [dispatch, clock, notifier, auth]);

  const value = useMemo<BooknoteContextValue>(
    () => ({ state, now: clock, hydrated, authed, actions, auth, notifier }),
    [state, clock, hydrated, authed, actions, auth, notifier],
  );

  return <BooknoteContext.Provider value={value}>{children}</BooknoteContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBooknote(): BooknoteContextValue {
  const ctx = useContext(BooknoteContext);
  if (!ctx) throw new Error('useBooknote must be used within a <BooknoteProvider>');
  return ctx;
}

export function useBooknoteState(): BooknoteState {
  return useBooknote().state;
}

export function useBooknoteActions(): BooknoteActions {
  return useBooknote().actions;
}

/** The fixed session clock, for relative date/time labels. */
export function useNow(): Date {
  return useBooknote().now;
}
