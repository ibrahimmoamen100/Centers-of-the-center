import { useQuery } from '@tanstack/react-query';
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
import { Center } from '@/stores/centersStore';
import { formatLocation, getStageLabel } from '@/lib/centerUtils';
import { Teacher, Session } from '@/types/center';


interface CenterDetailsData {
    center: Center;
    teachers: Teacher[];
    sessions: Session[];
}

/**
 * ⚡ Optimized Hook for Center Details using React Query
 * - Smart caching reduces Firebase reads dramatically
 * - Stale data served instantly while revalidating in background
 */
export function useCenterDetailsQuery(identifier?: string) {
    const fetchCenterDetails = async (): Promise<CenterDetailsData> => {
        if (!identifier) {
            throw new Error('No identifier provided');
        }

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

        // Fetch Teachers
        let teachersList: Teacher[] = [];
        try {
            const teachersSnapshot = await getDocs(
                collection(db, 'centers', centerId, 'teachers')
            );

            teachersList = teachersSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    photo: data.photo || data.image || data.profilePic,
                    subjects: Array.isArray(data.subjects)
                        ? data.subjects
                        : (data.subject ? [data.subject] : []),
                    subject: data.subject,
                    grade: data.grade,
                    experience: data.experience,
                    rating: data.rating,
                    bio: data.bio || data.description,
                };
            });
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }

        // Fetch Sessions
        let sessionsList: Session[] = [];
        try {
            const sessionsSnapshot = await getDocs(
                collection(db, 'centers', centerId, 'sessions')
            );
            sessionsList = sessionsSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    subject: data.subject || '', // Ensure subject is always present
                    teacher: data.teacher,
                    teacherName: data.teacherName,
                    teacherId: data.teacherId,
                    teacherImage: data.teacherImage,
                    time: data.time,
                    sessionTime: data.sessionTime,
                    duration: data.duration,
                    day: data.day,
                    color: data.color,
                    type: data.type,
                    startDateTime: data.startDateTime,
                    endDateTime: data.endDateTime,
                    grade: data.grade,
                    notes: data.notes,
                };
            });
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }

        return {
            center: centerData,
            teachers: teachersList,
            sessions: sessionsList,
        };
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['center-details', identifier],
        queryFn: fetchCenterDetails,
        enabled: !!identifier, // Only run query if identifier exists
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes (center details cached longer)
    });

    return {
        center: data?.center || null,
        teachers: data?.teachers || [],
        sessions: data?.sessions || [],
        loading: isLoading,
        error: error?.message || null,
        refetch,
    };
}
