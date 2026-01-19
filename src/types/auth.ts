import { Timestamp } from "firebase/firestore";

// User Roles
export type UserRole = 'super_admin' | 'center_admin' | 'user';

export type UserStatus = 'active' | 'pending' | 'suspended';

export type CenterStatus = 'active' | 'pending' | 'suspended';

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// User Interface
export interface User {
    uid: string;
    email: string;
    role: UserRole;
    centerId?: string; // Required if role is center_admin
    status: UserStatus;
    displayName?: string;
    photoURL?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Center Interface
export interface Center {
    id: string;
    name: string;
    email: string;
    adminUid: string; // The user who manages this center
    status: CenterStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string; // uid of super admin or self-registered

    // Center Details
    logo?: string;
    location?: string;
    governorate?: string;
    area?: string;
    stage?: string;
    subjects?: string[];
    rating?: number;
    reviewCount?: number;
    teacherCount?: number;
    description?: string;
    phone?: string;
    address?: string;
    website?: string;
}

// Invitation Interface
export interface Invitation {
    id: string;
    email: string;
    role: 'center_admin'; // Currently only for center admins
    centerId: string;
    centerName: string;
    invitedBy: string; // uid of super admin
    status: InvitationStatus;
    token: string; // Unique verification token
    expiresAt: Timestamp;
    createdAt: Timestamp;
    acceptedAt?: Timestamp;
}

// Auth Context Type
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    userRole: UserRole | null;
    centerId: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
}

// Center Registration Form Data
export interface CenterRegistrationData {
    // Auth Info
    email: string;
    password: string;
    confirmPassword: string;

    // Center Info
    centerName: string;
    phone: string;
    governorate: string;
    area: string;
    address?: string;
    description?: string;
    stage?: string;
    subjects?: string[];
    website?: string;
}

// Invitation Form Data
export interface InvitationFormData {
    email: string;
    centerId: string;
    centerName: string;
    message?: string;
}
