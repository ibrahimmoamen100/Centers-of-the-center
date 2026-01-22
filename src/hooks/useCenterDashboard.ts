import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useCenterDashboardStore, CenterDashboardData } from '@/stores/centerDashboardStore';
import { toast } from 'sonner';

/**
 * Custom hook for managing center dashboard data with React Query + Firebase Realtime
 * 
 * Features:
 * - ✅ Real-time updates via Firebase onSnapshot
 * - ✅ Automatic caching with React Query
 * - ✅ Authentication management
 * - ✅ Zustand state synchronization
 * - ✅ Minimal Firebase reads
 * 
 * @returns Center dashboard data, loading state, and error
 */
export function useCenterDashboard() {
    const [userId, setUserId] = useState<string | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const queryClient = useQueryClient();
    const { setCenterData, setIsLoading, setError } = useCenterDashboardStore();

    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUserId(user?.uid || null);
            setAuthChecked(true);

            if (!user) {
                // Clear cache when user logs out
                queryClient.removeQueries({ queryKey: ['center-dashboard'] });
                setCenterData(null);
            }
        });

        return () => unsubscribe();
    }, [queryClient, setCenterData]);

    // React Query setup with Firebase realtime listener
    const query = useQuery({
        queryKey: ['center-dashboard', userId],
        queryFn: async () => {
            return new Promise<CenterDashboardData>((resolve, reject) => {
                if (!userId) {
                    reject(new Error('No user authenticated'));
                    return;
                }

                const docRef = doc(db, 'centers', userId);
                let unsubscribe: Unsubscribe;

                // Set up real-time listener
                unsubscribe = onSnapshot(
                    docRef,
                    (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();

                            // Check expiration
                            const now = new Date();
                            const endDate = data.subscription?.endDate
                                ? new Date(data.subscription.endDate)
                                : null;
                            const isExpired = endDate && endDate < now;
                            const subStatus = isExpired
                                ? 'expired'
                                : (data.subscription?.status || 'inactive');

                            // Normalize data with proper subscription defaults
                            const centerData: CenterDashboardData = {
                                ...data,
                                id: userId,
                                name: data.name || data.centerName || 'المركز التعليمي',
                                logo: data.logo || null,
                                operationsUsed: data.operationsUsed || 0,
                                operationsLimit: data.operationsLimit || 10,
                                subscription: {
                                    status: subStatus as "active" | "expired" | "suspended",
                                    amount: data.subscription?.amount || 300,
                                    startDate: data.subscription?.startDate || new Date().toISOString(),
                                    endDate: data.subscription?.endDate || new Date().toISOString(),
                                },
                            };

                            // Update React Query cache
                            queryClient.setQueryData(['center-dashboard', userId], centerData);

                            // Resolve the promise on first data load
                            resolve(centerData);
                        } else {
                            reject(new Error('Center data not found'));
                        }
                    },
                    (error) => {
                        console.error('Error in center dashboard snapshot:', error);
                        reject(error);
                    }
                );

                // Cleanup function (important!)
                return () => {
                    if (unsubscribe) unsubscribe();
                };
            });
        },
        enabled: authChecked && !!userId, // Only run when auth is checked and user exists
        staleTime: Infinity, // Data is always fresh due to real-time listener
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes after unmount
        refetchOnWindowFocus: false, // No need to refetch, we have real-time updates
        refetchOnMount: false, // No need to refetch, we have real-time updates
        retry: 1,
    });

    // Sync with Zustand store
    useEffect(() => {
        if (query.data) {
            setCenterData(query.data);
        }
        setIsLoading(query.isLoading);
        setError(query.error?.message || null);
    }, [query.data, query.isLoading, query.error, setCenterData, setIsLoading, setError]);

    // Show toast on error
    useEffect(() => {
        if (query.error) {
            toast.error('حدث خطأ أثناء جلب بيانات المركز');
        }
    }, [query.error]);

    return {
        centerData: query.data || null,
        isLoading: query.isLoading || !authChecked,
        error: query.error,
        isAuthenticated: !!userId,
        authChecked,
        refetch: query.refetch,
    };
}

/**
 * Hook to invalidate center dashboard cache
 * Use after updating center data to trigger a refresh
 */
export function useInvalidateCenterDashboard() {
    const queryClient = useQueryClient();
    const userId = auth.currentUser?.uid;

    return () => {
        if (userId) {
            queryClient.invalidateQueries({ queryKey: ['center-dashboard', userId] });
        }
    };
}
