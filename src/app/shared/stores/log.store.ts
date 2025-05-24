import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { LogEntry } from '../../models/log-entry.model';

interface LogState {
  entries: LogEntry[];
}

const initialState: LogState = {
  entries: []
};

export const LogStore = signalStore(
  { providedIn: 'root' },
  withState<LogState>(initialState),
  withMethods((store) => ({
    /**
     * Adds a new log entry to the beginning of the log
     */
    addEntry(entry: LogEntry): void {
      const currentEntries = store.entries();
      patchState(store, {
        entries: [entry, ...currentEntries]
      });
    },

    /**
     * Clears all log entries
     */
    clearLog(): void {
      patchState(store, { entries: [] });
    },

    /**
     * Gets the most recent log entries up to a specified limit
     */
    getRecentEntries(limit: number = 50): LogEntry[] {
      return store.entries().slice(0, limit);
    }
  }))
);
