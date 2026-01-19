import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Clock, AlertTriangle, CalendarDays, Repeat } from "lucide-react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, getDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatArabicTime, formatArabicDateTime } from "@/lib/dateUtils";

interface Session {
  id: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  type: 'recurring' | 'single';
  day?: string; // For recurring (day name)
  startDateTime: string; // ISO string
  endDateTime?: string; // ISO string (for recurring end date, or single session end time)
  sessionTime?: string; // Time string (e.g. "14:00") for recurring
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
}

interface SessionsManagementProps {
  canEdit: boolean;
  remainingOps: number;
  centerId: string;
}

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export function SessionsManagement({ canEdit, remainingOps, centerId }: SessionsManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [centerGrades, setCenterGrades] = useState<string[]>([]);

  useEffect(() => {
    fetchSessions();
    fetchTeachers();
    fetchCenterData();
  }, [centerId]);

  const fetchTeachers = async () => {
    try {
      const q = query(collection(db, "centers", centerId, "teachers"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Teacher));
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchCenterData = async () => {
    try {
      const centerDoc = await getDoc(doc(db, "centers", centerId));
      if (centerDoc.exists()) {
        setCenterGrades(centerDoc.data().grades || []);
      }
    } catch (error) {
      console.error("Error fetching center data:", error);
    }
  };

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
      toast.error("فشل تحميل الحصص");
    } finally {
      setIsLoading(false);
    }
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSession, setNewSession] = useState<Omit<Session, "id">>({
    subject: "",
    teacherId: "",
    teacherName: "",
    grade: "",
    type: "single",
    startDateTime: "",
    endDateTime: "",
    sessionTime: "",
    day: ""
  });

  const updateOperations = async () => {
    try {
      await updateDoc(doc(db, "centers", centerId), {
        operationsUsed: increment(1)
      });
    } catch (e) {
      console.error("Failed to update operations count", e);
    }
  };

  const handleAdd = async () => {
    if (!canEdit) return;
    try {
      // Ensure day is set for single sessions based on date
      let sessionDay = newSession.day;
      if (newSession.type === 'single' && newSession.startDateTime) {
        const date = new Date(newSession.startDateTime);
        sessionDay = date.toLocaleDateString('ar-EG', { weekday: 'long' });
      }

      const sessionData = {
        ...newSession,
        day: sessionDay
      };

      const docRef = await addDoc(collection(db, "centers", centerId, "sessions"), sessionData);

      const session: Session = {
        id: docRef.id,
        ...sessionData
      };

      setSessions([...sessions, session]);
      setNewSession({
        subject: "",
        teacherId: "",
        teacherName: "",
        grade: "",
        type: "single",
        startDateTime: "",
        endDateTime: "",
        sessionTime: "",
        day: ""
      });
      setIsAddOpen(false);
      updateOperations();
      toast.success("تم إضافة الحصة بنجاح");
    } catch (error) {
      console.error("Error adding session:", error);
      toast.error("فشل إضافة الحصة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    try {
      await deleteDoc(doc(db, "centers", centerId, "sessions", id));
      setSessions(sessions.filter(s => s.id !== id));
      updateOperations();
      toast.success("تم حذف الحصة بنجاح");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("فشل حذف الحصة");
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      "الرياضيات": "bg-blue-100 text-blue-800",
      "الفيزياء": "bg-purple-100 text-purple-800",
      "الكيمياء": "bg-green-100 text-green-800",
      "الأحياء": "bg-emerald-100 text-emerald-800",
      "اللغة العربية": "bg-amber-100 text-amber-800",
      "اللغة الإنجليزية": "bg-red-100 text-red-800",
    };
    return colors[subject] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الحصص</h1>
          <p className="text-muted-foreground">إضافة وتعديل مواعيد الحصص</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canEdit} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة حصة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة حصة جديدة</DialogTitle>
              <DialogDescription>أدخل بيانات الحصة الجديدة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Teacher Selection */}
              <div className="space-y-2">
                <Label>المدرس (سيتم تحديد المادة تلقائياً)</Label>
                <Select
                  value={newSession.teacherId}
                  onValueChange={(teacherId) => {
                    const selectedTeacher = teachers.find(t => t.id === teacherId);
                    setNewSession({
                      ...newSession,
                      teacherId,
                      teacherName: selectedTeacher?.name || '',
                      subject: selectedTeacher?.subject || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدرس" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">لا يوجد مدرسين مسجلين</div>
                    ) : (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.subject}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Display Subject (Read-only) */}
              {newSession.subject && (
                <div className="p-2 bg-muted rounded-md flex items-center gap-2">
                  <span className="text-sm font-medium">المادة المختارة:</span>
                  <Badge variant="secondary">{newSession.subject}</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الحصة</Label>
                  <Select
                    value={newSession.type}
                    onValueChange={(value: 'recurring' | 'single') => setNewSession({ ...newSession, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">حصة فردية (مرة واحدة)</SelectItem>
                      <SelectItem value="recurring">حصة مستمرة (أسبوعية)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الصف</Label>
                  <Select
                    value={newSession.grade}
                    onValueChange={(value) => setNewSession({ ...newSession, grade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {centerGrades.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">لا توجد صفوف مسجلة</div>
                      ) : (
                        centerGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditional Fields based on Type */}
              {newSession.type === 'single' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ ووقت البداية</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.startDateTime}
                      onChange={(e) => setNewSession({ ...newSession, startDateTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ ووقت النهاية (اختياري)</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.endDateTime || ''}
                      onChange={(e) => setNewSession({ ...newSession, endDateTime: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>تاريخ البداية (أول حصة)</Label>
                      <Input
                        type="date"
                        value={newSession.startDateTime ? newSession.startDateTime.split('T')[0] : ''}
                        onChange={(e) => setNewSession({ ...newSession, startDateTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ النهاية (اختياري)</Label>
                      <Input
                        type="date"
                        value={newSession.endDateTime ? newSession.endDateTime.split('T')[0] : ''}
                        onChange={(e) => setNewSession({ ...newSession, endDateTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>يوم التكرار</Label>
                      <Select
                        value={newSession.day}
                        onValueChange={(value) => setNewSession({ ...newSession, day: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اليوم" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>وقت الحصة</Label>
                      <Input
                        type="time"
                        value={newSession.sessionTime || ''}
                        onChange={(e) => setNewSession({ ...newSession, sessionTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
              <Button onClick={handleAdd}>إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!canEdit && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">
              انتهت العمليات المتاحة. جدد اشتراكك للاستمرار في التعديل.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {days.map((day) => {
          const daySessions = sessions.filter(s => s.day === day);
          if (daySessions.length === 0) return null;

          return (
            <div key={day}>
              <h3 className="font-bold mb-3 text-lg">{day}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {daySessions.map((session) => (
                  <Card key={session.id} className="relative overflow-hidden">
                    {/* Type Indicator Strip */}
                    <div className={`absolute top-0 right-0 w-1 h-full ${session.type === 'recurring' ? 'bg-blue-500' : 'bg-purple-500'}`} />

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getSubjectColor(session.subject)}>
                          {session.subject}
                        </Badge>
                        <div className="flex gap-1">
                          {/* Actions... (Edit not fully implmented for new structure yet, just UI) */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={!canEdit}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الحصة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذه الحصة؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(session.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <p className="font-bold text-lg mb-1">{session.teacherName}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {session.grade}
                        </Badge>
                        <Badge variant="secondary" className="text-xs gap-1">
                          {session.type === 'recurring' ? <Repeat className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
                          {session.type === 'recurring' ? 'أسبوعية' : 'فردية'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                        <Clock className="h-3 w-3" />
                        <span>
                          {session.type === 'recurring'
                            ? `${formatArabicTime(session.sessionTime ? `2000-01-01T${session.sessionTime}` : undefined)}` // format time string
                            : formatArabicDateTime(session.startDateTime)
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
