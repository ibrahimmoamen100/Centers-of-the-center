import { useQuery } from '@tanstack/react-query';
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    startAfter,
    QueryConstraint,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCentersStore, Center } from '@/stores/centersStore';
import { useState } from 'react';

/**
 * ⚡ Optimized Hook using React Query + Zustand
 * - React Query: Handles data fetching, caching, and pagination
 * - Zustand: Manages UI state (filters only)
 * - Reduces Firebase reads significantly through smart caching
 */
export function useCentersQuery() {
    const { filters, pageSize } = useCentersStore();
    const [lastDocs, setLastDocs] = useState<Map<number, QueryDocumentSnapshot<DocumentData>>>(new Map());
    const [currentPage, setCurrentPage] = useState(1);

    // Generate unique query key based on filters
    const queryKey = [
        'centers',
        filters.governorate || 'all',
        filters.area || 'all',
        filters.stage || 'all',
        filters.grade || 'all',
        filters.subjects?.join(',') || 'all',
        filters.searchQuery || 'all',
        currentPage,
    ];

    const fetchCentersPage = async ({ queryKey }: any): Promise<{
        centers: Center[];
        hasMore: boolean;
        lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    }> => {
        const [, gov, area, stage, grade, subjects, searchQuery, page] = queryKey;

        const constraints: QueryConstraint[] = [];

        // Only active centers
        constraints.push(where('status', '==', 'active'));

        // Equality filters
        if (gov !== 'all') constraints.push(where('governorate', '==', gov));
        if (area !== 'all') constraints.push(where('area', '==', area));

        // Array filters (only one array-contains allowed)
        let arrayFilterUsed = false;

        if (searchQuery !== 'all' && !arrayFilterUsed) {
            constraints.push(where('searchKeywords', 'array-contains', searchQuery.toLowerCase()));
            arrayFilterUsed = true;
        } else if (subjects !== 'all' && !arrayFilterUsed) {
            const subjectsArray = subjects.split(',').slice(0, 10);
            if (subjectsArray.length > 0) {
                constraints.push(where('subjects', 'array-contains-any', subjectsArray));
                arrayFilterUsed = true;
            }
        } else if (stage !== 'all' && !arrayFilterUsed) {
            constraints.push(where('stages', 'array-contains', stage));
            arrayFilterUsed = true;
        } else if (grade !== 'all' && !arrayFilterUsed) {
            constraints.push(where('grades', 'array-contains', grade));
            arrayFilterUsed = true;
        }

        // Pagination
        constraints.push(limit(pageSize));

        const lastDoc = lastDocs.get(page - 1);
        if (page > 1 && lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const centersQuery = query(collection(db, 'centers'), ...constraints);
        const querySnapshot = await getDocs(centersQuery);

        // Fetch centers with teacher count
        const centersList = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const data = doc.data();

                // Calculate teacher count
                let teacherCount = data.teacherCount || 0;
                try {
                    const teachersSnapshot = await getDocs(
                        collection(db, 'centers', doc.id, 'teachers')
                    );
                    teacherCount = teachersSnapshot.size;
                } catch (error) {
                    console.warn(`Failed to fetch teacher count for ${doc.id}`);
                }

                return {
                    id: doc.id,
                    ...data,
                    teacherCount,
                    stage: (data.stages && data.stages.length > 0) ? data.stages[0] : '',
                    grade: (data.grades && data.grades.length > 0) ? data.grades[0] : '',
                } as Center;
            })
        );

        // Client-side filtering for filters not used in query
        let filteredCenters = centersList;

        if (stage !== 'all' && !constraints.some(c => (c as any).fieldPath?.segments?.[0] === 'stages')) {
            filteredCenters = filteredCenters.filter(center =>
                center.stages && center.stages.includes(stage)
            );
        }

        if (grade !== 'all' && !constraints.some(c => (c as any).fieldPath?.segments?.[0] === 'grades')) {
            filteredCenters = filteredCenters.filter(center =>
                center.grades && center.grades.includes(grade)
            );
        }

        // Sort by displayPriority
        filteredCenters.sort((a, b) => {
            const priorityA = a.displayPriority ?? null;
            const priorityB = b.displayPriority ?? null;

            if (priorityA !== null && priorityB !== null) return priorityA - priorityB;
            if (priorityA !== null && priorityB === null) return -1;
            if (priorityA === null && priorityB !== null) return 1;

            const getMillis = (d: any) => d?.toMillis ? d.toMillis() : (d ? new Date(d).getTime() : 0);
            return getMillis(b.createdAt) - getMillis(a.createdAt);
        });

        // Store last doc for pagination
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        if (lastVisibleDoc) {
            setLastDocs(prev => new Map(prev).set(page, lastVisibleDoc));
        }

        return {
            centers: filteredCenters.slice(0, pageSize),
            hasMore: querySnapshot.docs.length === pageSize,
            lastDoc: lastVisibleDoc,
        };
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: fetchCentersPage,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    const nextPage = () => {
        if (data?.hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const resetPagination = () => {
        setCurrentPage(1);
        setLastDocs(new Map());
    };

    return {
        centers: data?.centers || [],
        loading: isLoading,
        error: error?.message || null,
        hasMore: data?.hasMore || false,
        currentPage,
        nextPage,
        previousPage,
        resetPagination,
        refetch,
    };
}
