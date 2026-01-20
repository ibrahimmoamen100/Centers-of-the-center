import { useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    startAfter,
    orderBy,
    QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCentersStore } from '@/stores/centersStore';

/**
 * Hook محسّن لجلب المراكز مع Pagination و Caching
 * يقلل Firestore reads ويحسن الأداء
 */
export function useCentersWithPagination() {
    const {
        centers,
        currentPage,
        pageSize,
        hasMore,
        lastVisibleDoc,
        loading,
        error,
        filters,
        setCenters,
        appendCenters,
        setLoading,
        setError,
        setLastVisibleDoc,
        setHasMore,
        nextPage,
        resetPagination,
    } = useCentersStore();

    const fetchCenters = useCallback(async (isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            // ⚠️ Firestore Limitation: يمكن استخدام array-contains واحد فقط!
            // الحل: نستخدم الفلتر الأكثر تحديداً في Query، والباقي client-side

            const constraints: QueryConstraint[] = [];

            // فقط المراكز النشطة
            constraints.push(where('status', '==', 'active'));

            // ✅ فلاتر بسيطة (equality filters) - no problem
            if (filters.governorate) {
                constraints.push(where('governorate', '==', filters.governorate));
            }

            if (filters.area) {
                constraints.push(where('area', '==', filters.area));
            }

            // ⚠️ استخدام array-contains واحد فقط!
            // الأولوية: searchQuery > subjects > stage > grade
            let arrayFilterUsed = false;

            // 1. Search Query (أعلى أولوية)
            if (filters.searchQuery && filters.searchQuery.trim() && !arrayFilterUsed) {
                const searchLower = filters.searchQuery.toLowerCase().trim();
                constraints.push(where('searchKeywords', 'array-contains', searchLower));
                arrayFilterUsed = true;
            }

            // 2. Subjects (array-contains-any)
            else if (filters.subjects && filters.subjects.length > 0 && !arrayFilterUsed) {
                const subjectsToSearch = filters.subjects.slice(0, 10);
                constraints.push(where('subjects', 'array-contains-any', subjectsToSearch));
                arrayFilterUsed = true;
            }

            // 3. Stage
            else if (filters.stage && !arrayFilterUsed) {
                constraints.push(where('stages', 'array-contains', filters.stage));
                arrayFilterUsed = true;
            }

            // 4. Grade (lowest priority)
            else if (filters.grade && !arrayFilterUsed) {
                constraints.push(where('grades', 'array-contains', filters.grade));
                arrayFilterUsed = true;
            }

            // Pagination
            constraints.push(limit(pageSize * 2)); // جلب ضعف العدد للتعويض عن client-side filtering

            if (isLoadMore && lastVisibleDoc) {
                constraints.push(startAfter(lastVisibleDoc));
            }

            const centersQuery = query(collection(db, 'centers'), ...constraints);
            const querySnapshot = await getDocs(centersQuery);

            let fetchedCenters = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    stage: (data.stages && data.stages.length > 0) ? data.stages[0] : '',
                    grade: (data.grades && data.grades.length > 0) ? data.grades[0] : '',
                };
            }) as any[];

            // 🔍 Client-side filtering للفلاتر التي لم تُستخدم في Query

            // Filter by stage (if not used in query)
            if (filters.stage && !constraints.some(c => c.type === 'where' && (c as any).fieldPath?.segments?.[0] === 'stages')) {
                fetchedCenters = fetchedCenters.filter(center =>
                    center.stages && center.stages.includes(filters.stage)
                );
            }

            // Filter by grade (if not used in query)
            if (filters.grade && !constraints.some(c => c.type === 'where' && (c as any).fieldPath?.segments?.[0] === 'grades')) {
                fetchedCenters = fetchedCenters.filter(center =>
                    center.grades && center.grades.includes(filters.grade)
                );
            }

            // Filter by subjects (if not used in query)
            if (filters.subjects && filters.subjects.length > 0 &&
                !constraints.some(c => c.type === 'where' && (c as any).fieldPath?.segments?.[0] === 'subjects')) {
                fetchedCenters = fetchedCenters.filter(center =>
                    center.subjects && filters.subjects!.some(sub => center.subjects.includes(sub))
                );
            }

            // Limit to pageSize بعد الفلترة
            fetchedCenters = fetchedCenters.slice(0, pageSize);

            // ✨ Client-side sorting based on displayPriority
            // 1. Centers with displayPriority (sorted ascending by priority number)
            // 2. Centers without displayPriority (sorted descending by createdAt)
            fetchedCenters.sort((a, b) => {
                const priorityA = a.displayPriority ?? null;
                const priorityB = b.displayPriority ?? null;

                // Both have priority - sort by priority (lower is first)
                if (priorityA !== null && priorityB !== null) {
                    return priorityA - priorityB;
                }

                // Only A has priority - A comes first
                if (priorityA !== null && priorityB === null) {
                    return -1;
                }

                // Only B has priority - B comes first
                if (priorityA === null && priorityB !== null) {
                    return 1;
                }

                // Neither has priority - sort by createdAt (newest first)
                const getMillis = (d: any) => d?.toMillis ? d.toMillis() : (d ? new Date(d).getTime() : 0);
                return getMillis(b.createdAt) - getMillis(a.createdAt);
            });

            // Update state
            if (isLoadMore) {
                appendCenters(fetchedCenters);
            } else {
                setCenters(fetchedCenters);
            }

            // Update pagination
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastVisibleDoc(lastDoc || null);
            setHasMore(querySnapshot.docs.length === pageSize);

        } catch (err: any) {
            console.error('Error fetching centers:', err);
            setError(err.message || 'حدث خطأ أثناء جلب المراكز');
        } finally {
            setLoading(false);
        }
    }, [
        filters,
        pageSize,
        lastVisibleDoc,
        setCenters,
        appendCenters,
        setLoading,
        setError,
        setLastVisibleDoc,
        setHasMore,
    ]);

    // Fetch on mount and filter changes
    useEffect(() => {
        resetPagination();
        fetchCenters(false);
    }, [
        filters.governorate,
        filters.area,
        filters.stage,
        filters.grade,
        JSON.stringify(filters.subjects),
        filters.searchQuery,
    ]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            nextPage();
            fetchCenters(true);
        }
    }, [loading, hasMore, nextPage, fetchCenters]);

    return {
        centers,
        loading,
        error,
        hasMore,
        loadMore,
        currentPage,
    };
}
