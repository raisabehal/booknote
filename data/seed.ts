/**
 * The seeded "Rhythm Readers" demo club.
 *
 * Built so every screen is populated and — crucially — so the values the README
 * calls out as dynamic are *real*, not hardcoded:
 *  - The prototype's "11 members" is now an actual 11-member roster, so the meta
 *    line, avatar stacks, host picker and the "X of N finished" denominator all
 *    derive from `members`.
 *  - Meeting / poll dates are computed relative to the clock so the demo always
 *    reads as live whenever it's opened.
 *
 * The five named members keep their exact spec identities (name/initials/colour);
 * the remaining six fill out the roster with distinct warm/jewel tones.
 */

import { addDaysIso, isoOf, todayIso } from './format';
import type { BooknoteState, Member } from './models';

const NAMED_MEMBERS: Member[] = [
  { id: 'you', name: 'You', initials: 'YO', color: '#BD5D38', isCurrentUser: true },
  { id: 'maya', name: 'Maya R.', initials: 'MR', color: '#C99A2E' },
  { id: 'jordan', name: 'Jordan T.', initials: 'JT', color: '#5B7355' },
  { id: 'aisha', name: 'Aisha L.', initials: 'AL', color: '#7B6A9C' },
  { id: 'dev', name: 'Dev P.', initials: 'DP', color: '#4F7A82' },
];

// Six more members so the club genuinely has 11 people — these populate avatar
// overflow ("+N"), the host picker and the progress denominator.
const EXTRA_MEMBERS: Member[] = [
  { id: 'priya', name: 'Priya K.', initials: 'PK', color: '#6E8B5A' },
  { id: 'marcus', name: 'Marcus W.', initials: 'MW', color: '#355C7D' },
  { id: 'lena', name: 'Lena H.', initials: 'LH', color: '#9C5C6E' },
  { id: 'sam', name: 'Sam O.', initials: 'SO', color: '#B5773C' },
  { id: 'tariq', name: 'Tariq B.', initials: 'TB', color: '#8A6CC4' },
  { id: 'nina', name: 'Nina F.', initials: 'NF', color: '#A6533B' },
];

export const SEED_MEMBERS: Member[] = [...NAMED_MEMBERS, ...EXTRA_MEMBERS];

/** Build the full seeded domain state, with dates anchored to `now`. */
export function buildSeed(now: Date): BooknoteState {
  const today = todayIso(now);
  const nextMeetingDate = addDaysIso(today, 5);
  const upcoming1Date = addDaysIso(today, 33);
  const upcoming2Date = addDaysIso(today, 61);
  const pollClosesDate = addDaysIso(today, 3);

  return {
    user: { id: 'you', name: 'You', email: 'you@email.com' },

    club: {
      name: 'Rhythm Readers',
      location: 'Chapel Hill, NC',
      inviteCode: 'RR-2K26',
    },

    members: SEED_MEMBERS,

    meeting: {
      date: nextMeetingDate,
      time: '7:30pm',
      place: "Maya's apartment",
      hostId: 'maya',
      bookId: 'ntp',
      // 7 of 11 have finished the current read.
      finishedMemberIds: ['maya', 'jordan', 'aisha', 'dev', 'priya', 'marcus', 'lena'],
    },

    upcoming: [
      {
        id: 'u1',
        date: upcoming1Date,
        time: '7:30pm',
        hostId: 'jordan',
        place: "Jordan's place",
        book: { kind: 'vote', pollId: 'u1' },
      },
      {
        id: 'u2',
        date: upcoming2Date,
        time: '7:30pm',
        hostId: 'aisha',
        place: '',
        book: { kind: 'later' },
      },
    ],

    polls: [
      {
        id: 'u1',
        meetingId: 'u1',
        date: upcoming1Date,
        hostId: 'jordan',
        status: 'open',
        closesDate: pollClosesDate,
        myVote: null,
        candidates: [
          { id: 'c1', title: 'Wandering Stars', author: 'Tommy Orange', suggestedBy: 'dev', baseVotes: 5, color: '#7B6A9C', isAppPick: false },
          { id: 'c2', title: 'The Heaven & Earth Grocery Store', author: 'James McBride', suggestedBy: 'maya', baseVotes: 4, color: '#BD5D38', isAppPick: false },
          { id: 'c3', title: 'The Vaster Wilds', author: 'Lauren Groff', suggestedBy: 'aisha', baseVotes: 2, color: '#4F7A82', isAppPick: false },
        ],
      },
    ],

    appPicks: [
      { id: 'a1', title: 'James', author: 'Percival Everett', color: '#C99A2E' },
      { id: 'a2', title: 'The Ministry of Time', author: 'Kaliane Bradley', color: '#8A6CC4' },
    ],

    books: [
      { id: 'ntp', title: 'No Two Persons', author: 'Erica Bauermeister', genre: 'Literary Fiction', color: '#5B7355', textColor: '#EFE9D6', status: 'reading', clubRating: null, myRating: 0, date: 'Jun 25', blurb: 'One novel, ten readers, ten lives quietly altered. Bauermeister follows a single book from writer to stranger, tracing how the same words land differently in every pair of hands.' },
      { id: 'wager', title: 'The Wager', author: 'David Grann', genre: 'Nonfiction', color: '#BD5D38', textColor: '#FBE9DF', status: 'read', clubRating: 4.5, myRating: 5, date: 'Apr 2026', blurb: 'A 1740s shipwreck off Patagonia, a mutiny, and two irreconcilable survival stories that put the British Empire itself on trial.' },
      { id: 'tomlake', title: 'Tom Lake', author: 'Ann Patchett', genre: 'Literary Fiction', color: '#5B7355', textColor: '#E9F0E2', status: 'read', clubRating: 4.2, myRating: 4, date: 'Mar 2026', blurb: 'On a Michigan cherry orchard during lockdown, a mother tells her grown daughters the story of the famous actor she once loved.' },
      { id: 'demon', title: 'Demon Copperhead', author: 'Barbara Kingsolver', genre: 'Literary Fiction', color: '#C99A2E', textColor: '#FBF2DC', status: 'read', clubRating: 4.7, myRating: 5, date: 'Feb 2026', blurb: 'A modern retelling of David Copperfield set in Appalachia, narrated by a whip-smart boy born into poverty and the opioid crisis.' },
      { id: 'trust', title: 'Trust', author: 'Hernan Diaz', genre: 'Literary Fiction', color: '#7B6A9C', textColor: '#EFEAF5', status: 'read', clubRating: 3.8, myRating: 3, date: 'Jan 2026', blurb: 'Four nested narratives circle a Jazz-Age financier and his wife, each version rewriting who really built the fortune.' },
      { id: 'yellow', title: 'Yellowface', author: 'R.F. Kuang', genre: 'Satire', color: '#4F7A82', textColor: '#E5EFF1', status: 'read', clubRating: 4.0, myRating: 4, date: 'Dec 2025', blurb: 'A writer steals her dead friend’s manuscript and the literary world it ignites — a razor-sharp satire of publishing, race and ambition.' },
      { id: 'babel', title: 'Babel', author: 'R.F. Kuang', genre: 'Fantasy', color: '#A6533B', textColor: '#F6E6E0', status: 'read', clubRating: 4.3, myRating: 5, date: 'Nov 2025', blurb: 'At an alternate-history Oxford, translation is literal magic — and the empire runs on it. A student must choose between the institution and revolution.' },
      { id: 'lessons', title: 'Lessons in Chemistry', author: 'Bonnie Garmus', genre: 'Historical Fiction', color: '#B5773C', textColor: '#FBEFDF', status: 'read', clubRating: 4.6, myRating: 5, date: 'Oct 2025', blurb: 'A 1960s chemist barred from her lab becomes the unlikely star of a cooking show, teaching housewives science and self-worth.' },
      { id: 'covenant', title: 'The Covenant of Water', author: 'Abraham Verghese', genre: 'Literary Fiction', color: '#6E8B5A', textColor: '#EEF4E6', status: 'read', clubRating: 4.1, myRating: 4, date: 'Sep 2025', blurb: 'Three generations of a family in Kerala haunted by a curse — in every generation, one person drowns.' },
      { id: 'hail', title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Sci-Fi', color: '#355C7D', textColor: '#E2ECF3', status: 'read', clubRating: 4.8, myRating: 5, date: 'Aug 2025', blurb: 'A lone astronaut wakes with amnesia on a desperate mission to save the sun — and finds he isn’t the only one out there.' },
      { id: 'klara', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Sci-Fi', color: '#9C5C6E', textColor: '#F6E7EC', status: 'read', clubRating: 3.6, myRating: 3, date: 'Jul 2025', blurb: 'An artificial friend observes the human world with aching tenderness as she’s chosen by a sickly girl.' },
      { id: 'thursday', title: 'The Thursday Murder Club', author: 'Richard Osman', genre: 'Mystery', color: '#6E5A48', textColor: '#F0E9E0', status: 'read', clubRating: 3.9, myRating: 4, date: 'Jun 2025', blurb: 'Four retirement-village friends who meet to solve cold cases stumble onto a very fresh murder.' },
    ],

    messages: [
      { id: 'm1', authorId: 'maya', text: "Reminder we're at MY place this time — buzzer is 4B, come up to the third floor", createdAt: now.getTime() - 1000 * 60 * 60 * 52, reactions: { '❤️': 2, '😂': 0, '😮': 0 }, myReactions: {} },
      { id: 'm2', authorId: 'jordan', text: 'halfway through and the structure is wild — every chapter follows a different reader of the same novel', createdAt: now.getTime() - 1000 * 60 * 60 * 28, reactions: { '❤️': 3, '😂': 0, '😮': 1 }, myReactions: {} },
      { id: 'm3', authorId: 'dev', text: 'the bookseller chapter completely got me. no spoilers but ch. 9 hit hard', createdAt: now.getTime() - 1000 * 60 * 60 * 19, reactions: { '❤️': 4, '😂': 0, '😮': 2 }, myReactions: {} },
      { id: 'm4', authorId: 'aisha', text: 'ok who else teared up at the ending or was it just me', createdAt: now.getTime() - 1000 * 60 * 60 * 5, reactions: { '❤️': 1, '😂': 1, '😮': 0 }, myReactions: {} },
    ],

    rsvp: false,
  };
}

/** A blank ISO date helper kept for callers that need today's value directly. */
export function seedToday(now: Date): string {
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
}
