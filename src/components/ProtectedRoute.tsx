import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo = '/center/login',
}) => {
    const { user, loading: authLoading } = useAuth();
    const { userRole, loading: roleLoading } = useUserRole(user?.uid);
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (authLoading || roleLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (userRole && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and has the required role
    return <>{children}</>;
};

// Specific role-based route components for easier use
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['super_admin']} redirectTo="/admin/login">
        {children}
    </ProtectedRoute>
);

export const CenterAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['center_admin']} redirectTo="/center/login">
        {children}
    </ProtectedRoute>
);

export const AnyCenterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['super_admin', 'center_admin']} redirectTo="/center/login">
        {children}
    </ProtectedRoute>
);
