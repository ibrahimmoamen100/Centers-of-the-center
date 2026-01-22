import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Center {
    id: string;
    name: string;
    logo?: string;
    location: string;
    governorate?: string;
    area?: string;
    stage: string;
    stages?: string[]; // All stages offered by the center
    grade?: string; // Added for grade filtering
    subjects: string[];
    rating?: number;
    reviewCount?: number;
    teacherCount?: number;
    description?: string;
    createdAt?: Timestamp | Date;
    displayPriority?: number; // Added for admin-controlled sorting
    status?: string; // To ensure we only show active centers
    centerUsername?: string; // SEO-friendly URL identifier
}

export function useCenters(filters?: {
    governorate?: string;
    area?: string;
    stage?: string;
    grade?: string; // Added grade filter
    subjects?: string[];
    featured?: boolean;
    limitCount?: number;
}) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                setLoading(true);
                setError(null);

                // Base query: Only active centers
                let centersQuery = query(collection(db, "centers"), where("status", "==", "active"));

                // Apply filters
                if (filters?.governorate) {
                    centersQuery = query(centersQuery, where("governorate", "==", filters.governorate));
                }
                if (filters?.area) {
                    centersQuery = query(centersQuery, where("area", "==", filters.area));
                }
                if (filters?.stage) {
                    centersQuery = query(centersQuery, where("stage", "==", filters.stage));
                }
                if (filters?.grade) {
                    // Grade can be stored as array or string in selectedGrades
                    centersQuery = query(centersQuery, where("selectedGrades", "array-contains", filters.grade));
                }
                if (filters?.subjects && filters.subjects.length > 0) {
                    centersQuery = query(centersQuery, where("subjects", "array-contains-any", filters.subjects));
                }

                // Order by rating or createdAt
                // centersQuery = query(centersQuery, orderBy("createdAt", "desc"));

                // Apply limit if specified
                if (filters?.limitCount) {
                    centersQuery = query(centersQuery, limit(filters.limitCount));
                }

                const querySnapshot = await getDocs(centersQuery);

                // Fetch centers data and their teacher counts
                const centersDataPromises = querySnapshot.docs.map(async (doc) => {
                    const centerData = doc.data();

                    // Fetch teacher count from subcollection
                    let teacherCount = 0;
                    try {
                        const teachersSnapshot = await getDocs(
                            collection(db, 'centers', doc.id, 'teachers')
                        );
                        teacherCount = teachersSnapshot.size;
                    } catch (error) {
                        console.error(`Error fetching teachers for center ${doc.id}:`, error);
                    }

                    return {
                        id: doc.id,
                        ...centerData,
                        teacherCount
                    } as Center;
                });

                const centersData = await Promise.all(centersDataPromises);

                // Client-side sorting: First by displayPriority (admin control), then by createdAt
                centersData.sort((a, b) => {
                    // First priority: displayPriority (lower number = higher priority)
                    const priorityA = a.displayPriority ?? Number.MAX_SAFE_INTEGER;
                    const priorityB = b.displayPriority ?? Number.MAX_SAFE_INTEGER;

                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    // Second priority: createdAt (newer first)
                    const getMillis = (d: any) => d?.toMillis ? d.toMillis() : (d ? new Date(d).getTime() : 0);
                    return getMillis(b.createdAt) - getMillis(a.createdAt);
                });

                setCenters(centersData);
            } catch (err: any) {
                console.error("Error fetching centers:", err);
                setError(err.message);
                setCenters([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, [
        filters?.governorate,
        filters?.area,
        filters?.stage,
        filters?.grade, // Added grade dependency
        JSON.stringify(filters?.subjects || []),
        filters?.featured,
        filters?.limitCount
    ]);

    return { centers, loading, error };
}
