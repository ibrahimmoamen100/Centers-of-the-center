// Centralized type definitions for centers, teachers, and sessions

export interface Teacher {
    id: string;
    name: string;
    photo?: string;
    image?: string;
    subjects?: string[];
    subject?: string;
    grade?: string; // الصف الدراسي الذي يدرسه المدرس
    experience?: string;
    rating?: number;
    bio?: string;
}

export interface Session {
    id: string;
    subject: string;
    teacher?: string;
    teacherName?: string;
    teacherId?: string;
    teacherImage?: string; // صورة المدرس
    time?: string;
    sessionTime?: string;
    duration?: number;
    day?: number | string;
    color?: string;
    type?: 'recurring' | 'single';
    startDateTime?: string;
    endDateTime?: string;
    grade?: string;
    notes?: string;
}
