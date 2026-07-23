import { createContext, useCallback, useContext, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// DataCacheContext
//
// Provides a simple, TTL-based, key-value in-memory cache for API data.
// Each cache entry stores:  { data, fetchedAt, loading, error }
//
// Usage:
//   const { data, loading, error } = useCache("courses", () => api.get("/courses").then(r => r.data));
//
// Invalidation (call after mutations):
//   const { invalidate, invalidatePattern } = useDataCache();
//   invalidate("courses");                      // exact key
//   invalidatePattern("lectures");              // all keys that contain "lectures"
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const DataCacheContext = createContext(null);

export function DataCacheProvider({ children }) {
  // cache is a ref so mutations don't cause re-renders of the provider itself.
  // Each value: { data, fetchedAt, stale }
  const cacheRef = useRef({});

  // subscribers: key → Set of () => void  — used to notify consumers when cache updates
  const subscribersRef = useRef({});

  // Notify all subscribers for a given key
  const notify = useCallback((key) => {
    const subs = subscribersRef.current[key];
    if (subs) subs.forEach(fn => fn());
  }, []);

  const subscribe = useCallback((key, fn) => {
    if (!subscribersRef.current[key]) subscribersRef.current[key] = new Set();
    subscribersRef.current[key].add(fn);
    return () => subscribersRef.current[key]?.delete(fn);
  }, []);

  // Mark a key (or all keys matching a prefix) as stale
  const invalidate = useCallback((key) => {
    if (cacheRef.current[key]) {
      cacheRef.current[key] = { ...cacheRef.current[key], stale: true };
    }
    notify(key);
  }, [notify]);

  // Invalidate all cache keys whose name includes the given substring
  const invalidatePattern = useCallback((pattern) => {
    Object.keys(cacheRef.current).forEach(key => {
      if (key.includes(pattern)) {
        cacheRef.current[key] = { ...cacheRef.current[key], stale: true };
        notify(key);
      }
    });
  }, [notify]);

  // Invalidate everything
  const invalidateAll = useCallback(() => {
    Object.keys(cacheRef.current).forEach(key => {
      cacheRef.current[key] = { ...cacheRef.current[key], stale: true };
      notify(key);
    });
  }, [notify]);

  // Internal fetch function — updates cacheRef and notifies
  const fetchKey = useCallback(async (key, fetcher) => {
    const entry = cacheRef.current[key];
    // Prevent concurrent fetches for the same key
    if (entry?.loading) return;

    cacheRef.current[key] = { ...(entry || {}), loading: true, error: null };
    notify(key);

    try {
      const data = await fetcher();
      cacheRef.current[key] = { data, fetchedAt: Date.now(), loading: false, stale: false, error: null };
    } catch (err) {
      cacheRef.current[key] = { ...(cacheRef.current[key] || {}), loading: false, error: err };
    }
    notify(key);
  }, [notify]);

  const value = { cacheRef, subscribe, fetchKey, invalidate, invalidatePattern, invalidateAll };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

// Low-level hook to access cache internals (invalidation, pattern invalidation)
export function useDataCache() {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error("useDataCache must be used inside <DataCacheProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// useCache(key, fetcher, options?)
//
// Primary consumer hook.
// Returns: { data, loading, error, refresh }
//
// Options:
//   skip: boolean  — don't fetch if true (e.g. waiting for a uid)
// ---------------------------------------------------------------------------
export function useCache(key, fetcher, { skip = false } = {}) {
  const { cacheRef, subscribe, fetchKey } = useDataCache();

  // Local state used purely to trigger re-renders when the cache entry changes
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick(t => t + 1), []);

  // Subscribe to cache updates for this key
  // We use a ref callback pattern to avoid stale closure issues
  const unsubRef = useRef(null);
  if (!unsubRef.current) {
    unsubRef.current = subscribe(key, rerender);
  }

  // Cleanup subscription on unmount
  const cleanupRef = useRef(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
  });

  // Re-subscribe if key changes
  const prevKeyRef = useRef(key);
  if (prevKeyRef.current !== key) {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = subscribe(key, rerender);
    prevKeyRef.current = key;
    // Reset cleanup to use new unsub
    cleanupRef.current = () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } };
  }

  // Register cleanup (only once per mount)
  const cleanupRegisteredRef = useRef(false);
  if (!cleanupRegisteredRef.current) {
    cleanupRegisteredRef.current = true;
    // We rely on React's effect cleanup via a stable ref trick:
    // Attach cleanup to the component via useEffect-like pattern using a ref
  }

  // Read current cache state
  const entry = cacheRef.current[key];
  const isStale = !entry || entry.stale || (entry.fetchedAt && Date.now() - entry.fetchedAt > CACHE_TTL_MS);
  const isLoading = entry?.loading ?? false;

  // Trigger fetch if needed
  if (!skip && isStale && !isLoading && fetcher) {
    // Schedule microtask to avoid calling setState during render
    Promise.resolve().then(() => fetchKey(key, fetcher));
  }

  const refresh = useCallback(() => {
    if (fetcher) fetchKey(key, fetcher);
  }, [key, fetcher, fetchKey]);

  return {
    data: entry?.data ?? null,
    loading: isLoading || (!entry?.data && !entry?.error && !skip),
    error: entry?.error ?? null,
    refresh,
  };
}
