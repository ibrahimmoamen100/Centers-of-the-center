import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCenterDashboardStore } from "@/stores/centerDashboardStore";
import TimetableCalendar from "@/components/centers/TimetableCalendar";
import DailyTimetable from "@/components/centers/DailyTimetable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, GraduationCap, Loader2, AlertCircle, Clock } from "lucide-react";
import { Session, Teacher } from "@/types/center";
import ErrorBoundary from "@/components/ErrorBoundary";

interface TimetableManagementProps {
  centerId: string;
  canEdit?: boolean;
  remainingOps?: number;
}

export function TimetableManagement({ centerId }: TimetableManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const { centerData } = useCenterDashboardStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Sessions
        const sessionsQuery = query(collection(db, "centers", centerId, "sessions"));
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessionsData = sessionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Session));

        // Fetch Teachers
        const teachersQuery = query(collection(db, "centers", centerId, "teachers"));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Teacher));

        setSessions(sessionsData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching timetable data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (centerId) {
      fetchData();
    }
  }, [centerId]);

  // استخراج الصفوف التي تحتوي على حصص فقط
  const activeGrades = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const gradesWithSessions = new Set<string>();
    sessions.forEach(s => {
      if (s.grade) gradesWithSessions.add(s.grade);
    });

    if (centerData?.grades && centerData.grades.length > 0) {
      return centerData.grades.filter(g => gradesWithSessions.has(g));
    }

    return Array.from(gradesWithSessions).sort();
  }, [sessions, centerData]);

  // Set default grade to first active grade if available and not set
  useEffect(() => {
    if (activeGrades.length > 0 && !selectedGrade) {
      setSelectedGrade(activeGrades[0]);
    }
  }, [activeGrades, selectedGrade]);

  // تصفية الحصص حسب الصف المختار
  const filteredSessions = useMemo(() => {
    if (!selectedGrade) return [];
    return sessions.filter(session => session.grade === selectedGrade);
  }, [sessions, selectedGrade]);

  // تصفية المدرسين حسب الصف المختار
  const filteredTeachers = useMemo(() => {
    if (!selectedGrade || filteredSessions.length === 0) return [];

    const teacherIdsSet = new Set<string>();
    filteredSessions.forEach(session => {
      if (session.teacherId) teacherIdsSet.add(session.teacherId);
    });

    return teachers.filter(t => teacherIdsSet.has(t.id));
  }, [filteredSessions, teachers, selectedGrade]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">جاري تحميل الجدول...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الجدول الدراسي</h1>
          <p className="text-muted-foreground">عرض جدول الحصص كما يظهر للطلاب</p>
        </div>

        {/* Grade Selection */}
        {activeGrades.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <GraduationCap className="h-5 w-5 text-primary hidden sm:block" />
            <Select value={selectedGrade || ""} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="اختر الصف الدراسي" />
              </SelectTrigger>
              <SelectContent>
                {activeGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedGrade ? (
        <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>يرجى اختيار الصف الدراسي لعرض الجدول</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>لا يوجد حصص متاحة للصف الدراسي: {selectedGrade}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2 bg-muted/30 p-1 rounded-lg w-fit mx-auto border">
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('weekly')}
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="inline">أسبوعي</span>
            </Button>
            <Button
              variant={viewMode === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('daily')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="inline">يومي</span>
            </Button>
          </div>

          {/* Timetable View */}
          {viewMode === 'weekly' ? (
            <TimetableCalendar
              sessions={filteredSessions}
              teachers={filteredTeachers}
              openingTime={centerData?.openingTime}
              closingTime={centerData?.closingTime}
            />
          ) : (
            <DailyTimetable
              sessions={filteredSessions}
              teachers={filteredTeachers}
            />
          )}
        </div>
      )}
    </div>
  );
}
