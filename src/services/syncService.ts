import {
  doc,
  setDoc,
  getDocs,
  query,
  where,
  collection,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../firebase/config';
import type { Setlist } from '../types';
import { db as dexieDb } from '../db/schema';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncServiceState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
}

type StatusListener = (state: SyncServiceState) => void;

class SyncService {
  private static instance: SyncService;
  private firestore = getFirebaseFirestore();
  private status: SyncStatus = 'offline';
  private lastSyncedAt: string | null = null;
  private error: string | null = null;
  private listeners = new Set<StatusListener>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private userId: string | null = null;
  private pendingPush = false;
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;

  private constructor() {
    this.onlineHandler = () => {
      if (this.pendingPush) {
        this.setStatus('syncing');
      }
    };
    this.offlineHandler = () => {
      this.setStatus('offline');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async init(userId: string): Promise<void> {
    this.userId = userId;
    this.setStatus('syncing');

    try {
      const remoteSetlists = await this.pullSetlists();
      const localSetlists = await dexieDb.setlists
        .where('userId').equals(userId)
        .toArray();

      const localMap = new Map(localSetlists.map((s) => [s.id, s]));

      for (const remote of remoteSetlists) {
        const local = localMap.get(remote.id);
        if (!local) {
          await dexieDb.setlists.put(remote);
        } else if (new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime()) {
          await dexieDb.setlists.put(remote);
        }
        localMap.delete(remote.id);
      }

      this.lastSyncedAt = new Date().toISOString();
      this.setStatus('synced');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de synchronisation';
      this.error = msg;
      this.setStatus('offline');
    }
  }

  async pushSetlist(setlist: Setlist): Promise<void> {
    if (!this.userId) return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      this.setStatus('syncing');
      this.pendingPush = true;

      try {
        const docRef = doc(this.firestore, 'setlists', setlist.id);
        await setDoc(docRef, {
          ...setlist,
          userId: this.userId,
          updatedAt: new Date().toISOString(),
        });
        this.lastSyncedAt = new Date().toISOString();
        this.error = null;
        this.setStatus('synced');
        this.pendingPush = false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        this.error = msg;
        if (!navigator.onLine) {
          this.setStatus('offline');
        } else {
          this.setStatus('error');
        }
        this.pendingPush = false;
      }
    }, 1000);
  }

  private async pullSetlists(): Promise<Setlist[]> {
    if (!this.userId) return [];

    const q = query(
      collection(this.firestore, 'setlists'),
      where('userId', '==', this.userId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
        stageTimeLimit: data.stageTimeLimit ?? null,
      } as unknown as Setlist;
    });
  }

  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
    }
    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler);
    }
    this.listeners.clear();
    this.userId = null;
    this.status = 'offline';
  }

  getStatus(): SyncStatus {
    if (!navigator.onLine) return 'offline';
    return this.status;
  }

  onStatusChange(listener: StatusListener): void {
    this.listeners.add(listener);
    listener({
      status: this.getStatus(),
      lastSyncedAt: this.lastSyncedAt,
      error: this.error,
    });
  }

  offStatusChange(listener: StatusListener): void {
    this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus): void {
    this.status = status;
    const state: SyncServiceState = {
      status: this.getStatus(),
      lastSyncedAt: this.lastSyncedAt,
      error: this.error,
    };
    this.listeners.forEach((fn) => fn(state));
  }
}

export const syncService = SyncService.getInstance();