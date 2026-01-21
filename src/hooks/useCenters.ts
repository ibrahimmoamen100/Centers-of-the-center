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
    displayOrder?: number; // Added for admin-controlled sorting
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
                const centersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Center));

                // Client-side sorting: First by displayOrder (admin control), then by createdAt
                centersData.sort((a, b) => {
                    // First priority: displayOrder (lower number = higher priority)
                    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
                    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;

                    if (orderA !== orderB) {
                        return orderA - orderB;
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
