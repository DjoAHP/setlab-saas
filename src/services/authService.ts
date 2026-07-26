import {
  type User,
  type UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirebaseAuth } from '../firebase/config';

type UserListener = (user: User | null) => void;

class AuthService {
  private static instance: AuthService;
  private auth = getFirebaseAuth();
  private userListeners = new Set<UserListener>();
  private currentUser: User | null = null;
  private unsubAuth: (() => void) | null = null;
  private _initialized = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  init(): Promise<void> {
    return new Promise((resolve) => {
      if (this.unsubAuth) {
        this.unsubAuth();
      }
      this.unsubAuth = onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this._initialized = true;
        this.userListeners.forEach((fn) => fn(user));
        resolve();
      });
    });
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  onUserChange(listener: UserListener): void {
    this.userListeners.add(listener);
    if (this._initialized) {
      listener(this.currentUser);
    }
  }

  offUserChange(listener: UserListener): void {
    this.userListeners.delete(listener);
  }

  destroy(): void {
    if (this.unsubAuth) {
      this.unsubAuth();
      this.unsubAuth = null;
    }
    this.userListeners.clear();
    this.currentUser = null;
    this._initialized = false;
  }
}

export const authService = AuthService.getInstance();