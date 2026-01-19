import { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar } from "@/components/center/Calendar";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface TimetableManagementProps {
  canEdit: boolean;
  remainingOps: number;
  centerId: string;
}

interface Session {
  id: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  teacherImage?: string;
  grade: string;
  type: 'recurring' | 'single';
  day?: string;
  startDateTime: string;
  endDateTime?: string;
  sessionTime?: string;
}

export function TimetableManagement({ canEdit, remainingOps, centerId }: TimetableManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const q = query(collection(db, "centers", centerId, "sessions"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Session));
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [centerId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الجدول الدراسي</h1>
          <p className="text-muted-foreground">عرض جدول الحصص والفعاليات</p>
        </div>
      </div>

      {!canEdit && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">
              تنبيه: اشتراكك لا يسمح بالتعديل، ولكن يمكنك عرض الجدول.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل الجدول...</div>
      ) : (
        <Calendar sessions={sessions} />
      )}
    </div>
  );
}
