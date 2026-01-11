import { useSyncExternalStore } from 'react';
import { dataStore } from '../store/DataStore';

/**
 * Hook to subscribe to a specific item in the store.
 * Only re-renders when that specific item changes.
 */
export function useStoreItem<T>(id: string, selector: () => T): T {
    return useSyncExternalStore(
        (callback) => dataStore.subscribeToItem(id, callback),
        selector
    );
}
