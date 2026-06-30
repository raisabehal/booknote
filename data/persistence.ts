/**
 * Local-first persistence behind a narrow interface, so the storage backend can
 * later be swapped for a real API/sync layer without touching the store or UI.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BooknoteState } from './models';

/** Bumped when the persisted shape changes; mismatched payloads are discarded. */
export const PERSIST_VERSION = 2;

interface Envelope {
  version: number;
  state: BooknoteState;
}

export interface PersistenceAdapter {
  load(): Promise<BooknoteState | null>;
  save(state: BooknoteState): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_KEY = 'booknote:state';

/** Default adapter — persists to the device via AsyncStorage. */
export class AsyncStoragePersistence implements PersistenceAdapter {
  constructor(private readonly key: string = STORAGE_KEY) {}

  async load(): Promise<BooknoteState | null> {
    try {
      const raw = await AsyncStorage.getItem(this.key);
      if (!raw) return null;
      const env = JSON.parse(raw) as Envelope;
      if (!env || env.version !== PERSIST_VERSION) return null;
      return env.state;
    } catch {
      return null;
    }
  }

  async save(state: BooknoteState): Promise<void> {
    const env: Envelope = { version: PERSIST_VERSION, state };
    try {
      await AsyncStorage.setItem(this.key, JSON.stringify(env));
    } catch {
      // Best-effort; a failed local write shouldn't crash the app.
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.key);
    } catch {
      // ignore
    }
  }
}

/** In-memory adapter — handy for tests and as a no-persistence fallback. */
export class InMemoryPersistence implements PersistenceAdapter {
  private snapshot: BooknoteState | null = null;

  async load(): Promise<BooknoteState | null> {
    return this.snapshot;
  }

  async save(state: BooknoteState): Promise<void> {
    this.snapshot = state;
  }

  async clear(): Promise<void> {
    this.snapshot = null;
  }
}

export const defaultPersistence: PersistenceAdapter = new AsyncStoragePersistence();
