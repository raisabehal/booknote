/**
 * Authentication behind an interface. The onboarding flow (milestone 3) talks
 * only to `AuthProvider`, so the mock here can be replaced by a real
 * email+password backend later without changing any screens.
 */

import type { User } from './models';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthProvider {
  /** The currently authenticated user, if a session exists. */
  getCurrentUser(): Promise<User | null>;
  signUp(input: SignUpInput): Promise<User>;
  signIn(input: SignInInput): Promise<User>;
  signOut(): Promise<void>;
}

/**
 * Mock provider — accepts any input and returns a local "you" user. It keeps
 * the seeded user id (`you`) so the signed-in account maps onto the demo club's
 * member record. No real validation or network.
 */
export class MockAuthProvider implements AuthProvider {
  private current: User | null = null;

  async getCurrentUser(): Promise<User | null> {
    return this.current;
  }

  async signUp({ name, email }: SignUpInput): Promise<User> {
    this.current = { id: 'you', name: name.trim() || 'You', email: email.trim() || 'you@email.com' };
    return this.current;
  }

  async signIn({ email }: SignInInput): Promise<User> {
    this.current = { id: 'you', name: 'You', email: email.trim() || 'you@email.com' };
    return this.current;
  }

  async signOut(): Promise<void> {
    this.current = null;
  }
}

export const defaultAuth: AuthProvider = new MockAuthProvider();
