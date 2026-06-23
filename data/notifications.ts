/**
 * Notifications behind an interface. Domain actions fire these events; the
 * default implementation is a no-op (with a console variant for debugging).
 * A later milestone swaps in real push + in-app delivery for "poll sent",
 * "meeting scheduled/changed" and reminders — without changing call sites.
 */

import type { Meeting, Poll, UpcomingMeeting } from './models';

export interface Notifier {
  /** A poll was sent to the club (draft → open). */
  pollSent(poll: Poll): void;
  /** A new meeting was added to the schedule. */
  meetingScheduled(meeting: UpcomingMeeting | Meeting): void;
  /** An existing meeting's details changed. */
  meetingChanged(meeting: UpcomingMeeting | Meeting): void;
  /** A reminder for an upcoming meeting. */
  meetingReminder(meeting: UpcomingMeeting | Meeting): void;
}

/** Does nothing — the production default until real delivery is wired. */
export class NoopNotifier implements Notifier {
  pollSent(): void {}
  meetingScheduled(): void {}
  meetingChanged(): void {}
  meetingReminder(): void {}
}

/** Logs events — useful while building so the seams are observable. */
export class ConsoleNotifier implements Notifier {
  pollSent(poll: Poll): void {
    console.log('[notify] poll sent for meeting', poll.meetingId);
  }
  meetingScheduled(meeting: UpcomingMeeting | Meeting): void {
    console.log('[notify] meeting scheduled', meeting.date);
  }
  meetingChanged(meeting: UpcomingMeeting | Meeting): void {
    console.log('[notify] meeting changed', meeting.date);
  }
  meetingReminder(meeting: UpcomingMeeting | Meeting): void {
    console.log('[notify] meeting reminder', meeting.date);
  }
}

export const defaultNotifier: Notifier = __DEV__ ? new ConsoleNotifier() : new NoopNotifier();
