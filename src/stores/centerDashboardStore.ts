import { create } from 'zustand';
import { CenterTab } from '@/pages/CenterDashboard';

// Center data type
export interface CenterDashboardData {
    id: string;
    name: string;
    logo?: string | null;
    operationsUsed: number;
    operationsLimit: number;
    status?: string;
    subscription: {
        status: "active" | "expired" | "suspended";
        amount: number;
        startDate: string;
        endDate: string;
    };
    [key: string]: any; // For any other properties
}

interface CenterDashboardStore {
    // UI State
    activeTab: CenterTab;
    setActiveTab: (tab: CenterTab) => void;

    // Center Data (cached from React Query)
    centerData: CenterDashboardData | null;
    setCenterData: (data: CenterDashboardData | null) => void;

    // Loading States
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // Error State
    error: string | null;
    setError: (error: string | null) => void;

    // Operations tracking
    remainingOperations: number;
    canPerformOperations: boolean;
    updateOperationsStatus: () => void;

    // Reset store
    reset: () => void;
}

const initialState = {
    activeTab: 'overview' as CenterTab,
    centerData: null,
    isLoading: true,
    error: null,
    remainingOperations: 0,
    canPerformOperations: false,
};

export const useCenterDashboardStore = create<CenterDashboardStore>((set, get) => ({
    ...initialState,

    setActiveTab: (tab) => set({ activeTab: tab }),

    setCenterData: (data) => {
        set({ centerData: data });
        // Automatically update operations status when data changes
        get().updateOperationsStatus();
    },

    setIsLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    updateOperationsStatus: () => {
        const { centerData } = get();
        if (!centerData) {
            set({ remainingOperations: 0, canPerformOperations: false });
            return;
        }

        const remainingOps = (centerData.operationsLimit || 10) - (centerData.operationsUsed || 0);
        const isActive = centerData.subscription?.status === 'active';
        const canPerform = isActive && remainingOps > 0;

        set({
            remainingOperations: remainingOps,
            canPerformOperations: canPerform,
        });
    },

    reset: () => set(initialState),
}));
