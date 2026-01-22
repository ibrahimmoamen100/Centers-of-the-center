import { create } from 'zustand';
import { Center } from './centersStore';
import { Teacher, Session } from '@/types/center';

// Re-export for backward compatibility
export type { Teacher, Session };


interface CenterDetailsState {
    center: Center | null;
    teachers: Teacher[];
    sessions: Session[];
    loading: boolean;
    error: string | null;

    // Cache to avoid re-fetching
    lastFetchedId: string | null;
    lastFetchedAt: number | null;

    // Actions
    setCenter: (center: Center | null) => void;
    setTeachers: (teachers: Teacher[]) => void;
    setSessions: (sessions: Session[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLastFetched: (id: string) => void;
    reset: () => void;
    shouldRefetch: (id: string, maxAge?: number) => boolean;
}

const initialState = {
    center: null,
    teachers: [],
    sessions: [],
    loading: false,
    error: null,
    lastFetchedId: null,
    lastFetchedAt: null,
};

export const useCenterDetailsStore = create<CenterDetailsState>((set, get) => ({
    ...initialState,

    setCenter: (center) => set({ center }),

    setTeachers: (teachers) => set({ teachers }),

    setSessions: (sessions) => set({ sessions }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    setLastFetched: (id) =>
        set({
            lastFetchedId: id,
            lastFetchedAt: Date.now()
        }),

    reset: () => set(initialState),

    shouldRefetch: (id, maxAge = 5 * 60 * 1000) => {
        const state = get();

        // Different center
        if (state.lastFetchedId !== id) return true;

        // No data yet
        if (!state.lastFetchedAt) return true;

        // Data is stale
        const age = Date.now() - state.lastFetchedAt;
        return age > maxAge;
    },
}));
