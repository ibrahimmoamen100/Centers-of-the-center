import { useEffect } from 'react';
import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCenterDetailsStore } from '@/stores/centerDetailsStore';
import { Center } from '@/stores/centersStore';
import { formatLocation, getStageLabel } from '@/lib/centerUtils';

/**
 * Hook محسّن لجلب تفاصيل مركز واحد مع Teachers و Sessions
 * يستخدم Caching لتقليل Firestore reads
 */
export function useCenterDetails(identifier?: string) {
    const {
        center,
        teachers,
        sessions,
        loading,
        error,
        setCenter,
        setTeachers,
        setSessions,
        setLoading,
        setError,
        setLastFetched,
        shouldRefetch,
        reset,
    } = useCenterDetailsStore();

    useEffect(() => {
        if (!identifier) {
            reset();
            return;
        }

        const fetchCenterDetails = async () => {
            try {
                // Check if we should refetch (cache logic)
                if (!shouldRefetch(identifier)) {
                    console.log('✅ Using cached data for center:', identifier);
                    return;
                }

                setLoading(true);
                setError(null);

                let centerDoc;
                let centerId: string;
                let data: any;

                // Detect if identifier is username or ID
                const isUsername = /^[a-z0-9-]+$/.test(identifier) && !identifier.match(/^[0-9a-zA-Z]{20,}$/);

                if (isUsername) {
                    // Query by centerUsername
                    const q = query(
                        collection(db, 'centers'),
                        where('centerUsername', '==', identifier),
                        where('status', '==', 'active'),
                        limit(1)
                    );
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        throw new Error('عذراً، هذا المركز غير موجود.');
                    }

                    centerDoc = snapshot.docs[0];
                    centerId = centerDoc.id;
                    data = centerDoc.data();
                } else {
                    // Query by document ID
                    const docRef = doc(db, 'centers', identifier);
                    centerDoc = await getDoc(docRef);

                    if (!centerDoc.exists()) {
                        throw new Error('عذراً، هذا المركز غير موجود.');
                    }

                    centerId = centerDoc.id;
                    data = centerDoc.data();
                }

                // Build center object
                const centerData: Center = {
                    id: centerId,
                    name: data.name,
                    logo: data.logo,
                    description: data.description,
                    location: formatLocation(data.governorate, data.area, data.address),
                    governorate: data.governorate,
                    area: data.area,
                    address: data.address || data.location,
                    phone: data.phone,
                    stage: (data.stages && data.stages.length > 0) ? getStageLabel(data.stages[0]) : '',
                    stages: (data.stages || []).map(getStageLabel),
                    grade: (data.grades && data.grades.length > 0) ? data.grades[0] : '',
                    grades: data.grades || [],
                    subjects: data.subjects || [],
                    rating: data.rating || 0,
                    reviewCount: data.reviewCount || 0,
                    teacherCount: data.teacherCount || 0,
                    centerUsername: data.centerUsername,
                    status: data.status,
                    workingHours: data.workingHours,
                    openingTime: data.openingTime,
                    closingTime: data.closingTime,
                    social: data.social || {
                        facebook: data.facebook,
                        instagram: data.instagram,
                        whatsapp: data.whatsapp,
                    },
                };

                setCenter(centerData);

                // Fetch Teachers (Subcollection)
                try {
                    console.log(`📚 Fetching teachers for center: ${centerId}`);
                    const teachersSnapshot = await getDocs(
                        collection(db, 'centers', centerId, 'teachers')
                    );
                    const teachersList = teachersSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as any[];

                    console.log(`✅ Fetched ${teachersList.length} teachers`);
                    setTeachers(teachersList);
                } catch (subError) {
                    console.error('❌ Error fetching teachers:', subError);
                    setTeachers([]);
                }

                // Fetch Sessions (Subcollection)
                try {
                    console.log(`📅 Fetching sessions for center: ${centerId}`);
                    const sessionsSnapshot = await getDocs(
                        collection(db, 'centers', centerId, 'sessions')
                    );
                    const sessionsList = sessionsSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as any[];

                    console.log(`✅ Fetched ${sessionsList.length} sessions`);
                    setSessions(sessionsList);
                } catch (subError) {
                    console.error('❌ Error fetching sessions:', subError);
                    setSessions([]);
                }

                // Mark as fetched
                setLastFetched(identifier);

            } catch (err: any) {
                console.error('❌ Error fetching center details:', err);
                setError(err.message || 'حدث خطأ أثناء تحميل بيانات المركز.');
            } finally {
                setLoading(false);
            }
        };

        fetchCenterDetails();
    }, [identifier]);

    return {
        center,
        teachers,
        sessions,
        loading,
        error,
    };
}
