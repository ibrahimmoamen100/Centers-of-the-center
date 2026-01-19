import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/types/auth';

interface UseUserRoleReturn {
    userRole: UserRole | null;
    centerId: string | null;
    loading: boolean;
    isSuperAdmin: boolean;
    isCenterAdmin: boolean;
    isUser: boolean;
}

export function useUserRole(uid?: string): UseUserRoleReturn {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [centerId, setCenterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setUserRole(null);
            setCenterId(null);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'users', uid),
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setUserRole(data.role || null);
                    setCenterId(data.centerId || null);
                } else {
                    setUserRole(null);
                    setCenterId(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching user role:', error);
                setUserRole(null);
                setCenterId(null);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    return {
        userRole,
        centerId,
        loading,
        isSuperAdmin: userRole === 'super_admin',
        isCenterAdmin: userRole === 'center_admin',
        isUser: userRole === 'user',
    };
}
