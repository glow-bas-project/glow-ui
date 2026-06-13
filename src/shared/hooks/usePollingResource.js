import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Fetches data on mount, polls on an interval, and exposes a manual refresh —
 * entirely outside React's effect/setState cycle, via useSyncExternalStore.
 */
export function usePollingResource(fetchFn, intervalMs) {
    const [store] = useState(() => createPollingStore(fetchFn, intervalMs));

    // Keep the latest fetchFn available to the store without recreating it
    useEffect(() => {
        store.setFetchFn(fetchFn);
    }, [store, fetchFn]);

    useEffect(() => {
        store.start();
        return () => store.stop();
    }, [store]);

    const subscribe = useCallback((listener) => store.subscribe(listener), [store]);
    const getSnapshot = useCallback(() => store.getSnapshot(), [store]);

    const snapshot = useSyncExternalStore(subscribe, getSnapshot);

    return { ...snapshot, refresh: store.refresh };
}

function createPollingStore(initialFetchFn, intervalMs) {
    let fetchFn = initialFetchFn;
    let snapshot = { data: null, loading: true, error: null };
    let listeners = new Set();
    let intervalId = null;

    const notify = () => {
        for (const listener of listeners) listener();
    };

    const refresh = async () => {
        try {
            const data = await fetchFn();
            snapshot = { data, loading: false, error: null };
        } catch (err) {
            snapshot = { ...snapshot, loading: false, error: err };
        }
        notify();
    };

    return {
        setFetchFn(fn) {
            fetchFn = fn;
        },
        getSnapshot() {
            return snapshot;
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        start() {
            if (intervalId !== null) return;
            refresh();
            intervalId = setInterval(refresh, intervalMs);
        },
        stop() {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
            listeners = new Set();
        },
        refresh,
    };
}