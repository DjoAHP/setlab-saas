import { useState, useEffect } from 'react';
import { syncService, type SyncServiceState } from '../services/syncService';

export function useSyncStatus(): SyncServiceState {
  const [state, setState] = useState<SyncServiceState>(() => ({
    status: syncService.getStatus(),
    lastSyncedAt: null,
    error: null,
  }));

  useEffect(() => {
    const handler = (s: SyncServiceState) => setState(s);
    syncService.onStatusChange(handler);
    return () => syncService.offStatusChange(handler);
  }, []);

  return state;
}