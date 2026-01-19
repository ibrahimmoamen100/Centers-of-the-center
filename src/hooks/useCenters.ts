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
    subjects: string[];
    rating?: number;
    reviewCount?: number;
    teacherCount?: number;
    description?: string;
    createdAt?: Timestamp | Date;
}

export function useCenters(filters?: {
    governorate?: string;
    area?: string;
    stage?: string;
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

                // Client-side sorting to avoid "Missing Index" error
                centersData.sort((a, b) => {
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
        JSON.stringify(filters?.subjects || []),
        filters?.featured,
        filters?.limitCount
    ]);

    return { centers, loading, error };
}
