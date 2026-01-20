import { create } from 'zustand';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export interface Center {
    id: string;
    name: string;
    logo?: string;
    location: string;
    governorate?: string;
    area?: string;
    address?: string;
    phone?: string;
    stage: string; // Main stage (for backward compatibility)
    stages: string[];
    grade?: string; // For filtering
    grades: string[];
    subjects: string[];
    rating?: number;
    reviewCount?: number;
    teacherCount?: number;
    description?: string;
    status?: string;
    centerUsername?: string;
    searchKeywords?: string[]; // للبحث السريع
    createdAt?: any;
    displayOrder?: number;
    displayPriority?: number | null; // ترتيب الأولوية (أقل رقم = يظهر أولاً)
    workingHours?: string;
    openingTime?: string;
    closingTime?: string;
    social?: {
        facebook?: string;
        instagram?: string;
        whatsapp?: string;
    };
}


interface CentersState {
    // All centers list
    centers: Center[];

    // Pagination
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
    lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null;

    // Loading & Error
    loading: boolean;
    error: string | null;

    // Filters
    filters: {
        governorate?: string;
        area?: string;
        stage?: string;
        grade?: string;
        subjects?: string[];
        searchQuery?: string;
    };

    // Actions
    setCenters: (centers: Center[]) => void;
    appendCenters: (centers: Center[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setFilters: (filters: CentersState['filters']) => void;
    setLastVisibleDoc: (doc: QueryDocumentSnapshot<DocumentData> | null) => void;
    setHasMore: (hasMore: boolean) => void;
    nextPage: () => void;
    resetPagination: () => void;
    reset: () => void;
}

const initialState = {
    centers: [],
    currentPage: 1,
    pageSize: 9,
    hasMore: true,
    lastVisibleDoc: null,
    loading: false,
    error: null,
    filters: {},
};

export const useCentersStore = create<CentersState>((set) => ({
    ...initialState,

    setCenters: (centers) => set({ centers }),

    appendCenters: (newCenters) =>
        set((state) => ({
            centers: [...state.centers, ...newCenters]
        })),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    setFilters: (filters) =>
        set({ filters, currentPage: 1, centers: [], lastVisibleDoc: null }),

    setLastVisibleDoc: (doc) => set({ lastVisibleDoc: doc }),

    setHasMore: (hasMore) => set({ hasMore }),

    nextPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),

    resetPagination: () =>
        set({
            currentPage: 1,
            centers: [],
            lastVisibleDoc: null,
            hasMore: true
        }),

    reset: () => set(initialState),
}));
