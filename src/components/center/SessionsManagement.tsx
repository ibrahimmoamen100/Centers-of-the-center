import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Clock, AlertTriangle, CalendarDays, Repeat, User } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { formatArabicTime, formatArabicDateTime } from "@/lib/dateUtils";

interface Session {
  id: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  teacherImage?: string; // Added teacherImage
  grade: string;
  type: 'recurring' | 'single';
  day?: string; // For recurring (day name)
  startDateTime: string; // ISO string (Start Date for recurring, or Start DateTime for single)
  endDateTime?: string; // ISO string (End Date for recurring, or optional End DateTime for single)
  sessionTime?: string; // Time string (e.g. "14:00") for recurring
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  image?: string; // Added image
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

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    subject: "",
    teacherId: "",
    teacherName: "",
    teacherImage: "",
    grade: "",
    type: "single" as 'recurring' | 'single',
    startDateTime: "",
    endDateTime: "",
    // Single session specific
    singleDate: "", // Helper for single session date/time input
    singleEndDate: "", // Helper for single session end date/time
    // Recurring specific
    startDate: "", // Helper for recurring start date
    endDate: "",   // Helper for recurring end date
    // Multi-day selection
    selectedDays: [] as string[],
    dayTimes: {} as Record<string, string>, // { "السبت": "14:00" }
    // Legacy single recurrence
    day: "",
    sessionTime: ""
  });

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

    // Validation
    if (!formData.teacherId || !formData.grade || !formData.subject) {
      toast.error("يرجى تعبئة جميع البيانات الأساسية");
      return;
    }

    try {
      const sessionsToAdd: Omit<Session, "id">[] = [];

      if (formData.type === 'single') {
        if (!formData.singleDate) {
          toast.error("يرجى تحديد تاريخ ووقت الحصة");
          return;
        }

        // Determine day name from date
        const date = new Date(formData.singleDate);
        const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });

        sessionsToAdd.push({
          subject: formData.subject,
          teacherId: formData.teacherId,
          teacherName: formData.teacherName,
          teacherImage: formData.teacherImage,
          grade: formData.grade,
          type: 'single',
          day: dayName,
          startDateTime: formData.singleDate, // Full ISO
          endDateTime: formData.singleEndDate || undefined,
        });

      } else {
        // Recurring
        if (formData.selectedDays.length === 0) {
          toast.error("يرجى اختيار يوم واحد على الأقل");
          return;
        }
        if (!formData.startDate) {
          toast.error("يرجى تحديد تاريخ البداية");
          return;
        }

        // Loop through selected days and create sessions
        for (const d of formData.selectedDays) {
          const time = formData.dayTimes[d];
          if (!time) {
            toast.error(`يرجى تحديد الوقت ليوم ${d}`);
            return;
          }

          sessionsToAdd.push({
            subject: formData.subject,
            teacherId: formData.teacherId,
            teacherName: formData.teacherName,
            teacherImage: formData.teacherImage,
            grade: formData.grade,
            type: 'recurring',
            day: d,
            startDateTime: formData.startDate, // YYYY-MM-DD
            endDateTime: formData.endDate || undefined, // YYYY-MM-DD
            sessionTime: time
          });
        }
      }

      // Add to Firestore
      const newIds: string[] = [];
      for (const sess of sessionsToAdd) {
        const docRef = await addDoc(collection(db, "centers", centerId, "sessions"), sess);
        newIds.push(docRef.id);
      }

      // Update State
      const newSessionsWithIds = sessionsToAdd.map((s, i) => ({ ...s, id: newIds[i] }));
      setSessions([...sessions, ...newSessionsWithIds]);

      // Reset Form
      resetForm();
      setIsAddOpen(false);
      updateOperations();
      toast.success("تم إضافة الحصة بنجاح");

    } catch (error) {
      console.error("Error adding session:", error);
      toast.error("فشل إضافة الحصة");
    }
  };

  const handleEdit = async () => {
    if (!canEdit || !editingSession) return;
    try {
      // Just update the single session document being edited
      const dayName = formData.type === 'single' && formData.singleDate
        ? new Date(formData.singleDate).toLocaleDateString('ar-EG', { weekday: 'long' })
        : formData.day; // Preserve existing day or update if needed? For recurring, user might change day.

      // Handle single session day recalc or recurring day from form
      let finalDay = dayName;
      if (formData.type === 'recurring') {
        // In edit mode for recurring, we only edit ONE session doc, so we look at formData.day/time
        // But wait, the form uses selectedDays for Add. For Edit, let's just use simple single-day inputs for simplicity 
        // OR adapt the form to show just one day selector if editing.
        // To keep it clean, I will skip using selectedDays for EDITING and just use formData.day
        finalDay = formData.day;
      }

      const updateData = {
        subject: formData.subject,
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        teacherImage: formData.teacherImage,
        grade: formData.grade,
        type: formData.type,
        day: finalDay,
        startDateTime: formData.type === 'single' ? formData.singleDate : formData.startDate,
        endDateTime: formData.type === 'single' ? (formData.singleEndDate || "") : (formData.endDate || ""),
        sessionTime: formData.type === 'recurring' ? formData.sessionTime : null
      };

      const sessionRef = doc(db, "centers", centerId, "sessions", editingSession.id);
      await updateDoc(sessionRef, updateData);

      setSessions(sessions.map(s => s.id === editingSession.id ? { ...s, ...updateData, id: s.id } : s));
      setEditingSession(null);
      setIsEditOpen(false);
      updateOperations();
      toast.success("تم تعديل الحصة بنجاح");
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("فشل تحديث الحصة");
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

  const openEditDialog = (session: Session) => {
    setEditingSession(session);
    setFormData({
      subject: session.subject,
      teacherId: session.teacherId,
      teacherName: session.teacherName,
      teacherImage: session.teacherImage || "",
      grade: session.grade,
      type: session.type,

      // Required base fields
      startDateTime: session.startDateTime,
      endDateTime: session.endDateTime || "",

      // Map to form helpers
      singleDate: session.type === 'single' ? session.startDateTime : "",
      singleEndDate: session.type === 'single' ? (session.endDateTime || "") : "",
      startDate: session.type === 'recurring' ? session.startDateTime : "",
      endDate: session.type === 'recurring' ? (session.endDateTime || "") : "",

      // Recurring specific
      day: session.day || "",
      sessionTime: session.sessionTime || "",
      selectedDays: session.day ? [session.day] : [],
      dayTimes: session.day && session.sessionTime ? { [session.day]: session.sessionTime } : {}
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      teacherId: "",
      teacherName: "",
      teacherImage: "",
      grade: "",
      type: "single",
      startDateTime: "",
      endDateTime: "",
      singleDate: "",
      singleEndDate: "",
      startDate: "",
      endDate: "",
      selectedDays: [],
      dayTimes: {},
      day: "",
      sessionTime: ""
    });
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedDays: [...prev.selectedDays, day]
      }));
    } else {
      setFormData(prev => {
        const newTimes = { ...prev.dayTimes };
        delete newTimes[day];
        return {
          ...prev,
          selectedDays: prev.selectedDays.filter(d => d !== day),
          dayTimes: newTimes
        };
      });
    }
  };

  const handleDayTimeChange = (day: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      dayTimes: {
        ...prev.dayTimes,
        [day]: time
      }
    }));
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

  // Reusable Form Content
  const renderFormContent = (isEdit: boolean) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>المدرس (سيتم تحديد المادة تلقائياً)</Label>
        <Select
          value={formData.teacherId}
          onValueChange={(teacherId) => {
            const selectedTeacher = teachers.find(t => t.id === teacherId);
            setFormData({
              ...formData,
              teacherId,
              teacherName: selectedTeacher?.name || '',
              subject: selectedTeacher?.subject || '',
              teacherImage: selectedTeacher?.image || ''
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

      {formData.subject && (
        <div className="p-2 bg-muted rounded-md flex items-center gap-2">
          <span className="text-sm font-medium">المادة المختارة:</span>
          <Badge variant="secondary">{formData.subject}</Badge>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نوع الحصة</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'recurring' | 'single') => setFormData({ ...formData, type: value })}
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
            value={formData.grade}
            onValueChange={(value) => setFormData({ ...formData, grade: value })}
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

      {formData.type === 'single' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>تاريخ ووقت البداية</Label>
            <Input
              type="datetime-local"
              value={formData.singleDate}
              onChange={(e) => setFormData({ ...formData, singleDate: e.target.value })}
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
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ النهاية</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="mb-2 block">أيام التكرار</Label>
            {isEdit ? (
              /* Single Day Edit Mode */
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اليوم</Label>
                  <Select value={formData.day} onValueChange={(val) => setFormData({ ...formData, day: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الساعة</Label>
                  <Input type="time" value={formData.sessionTime} onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })} />
                </div>
              </div>
            ) : (
              /* Multi-Day Add Mode */
              <div className="grid grid-cols-1 gap-2 border p-3 rounded-lg max-h-[200px] overflow-y-auto">
                {days.map((day) => (
                  <div key={day} className="flex items-center justify-between p-2 hover:bg-muted rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.selectedDays.includes(day)}
                        onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                      />
                      <span>{day}</span>
                    </div>
                    {formData.selectedDays.includes(day) && (
                      <Input
                        type="time"
                        className="w-32 h-8"
                        value={formData.dayTimes[day] || ""}
                        onChange={(e) => handleDayTimeChange(day, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الحصص</h1>
          <p className="text-muted-foreground">إضافة وتعديل مواعيد الحصص</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
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
            {renderFormContent(false)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الحصة</DialogTitle>
          </DialogHeader>
          {renderFormContent(true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleEdit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {days.map((day) => {
          const daySessions = sessions.filter(s => s.day === day);
          if (daySessions.length === 0) return null;

          return (
            <div key={day}>
              <h3 className="font-bold mb-3 text-lg">{day}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {daySessions.map((session) => (
                  <Card key={session.id} className="relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-1 h-full ${session.type === 'recurring' ? 'bg-blue-500' : 'bg-purple-500'}`} />

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getSubjectColor(session.subject)}>
                          {session.subject}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={!canEdit}
                            onClick={() => openEditDialog(session)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
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

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {session.teacherImage ? (
                            <img src={session.teacherImage} alt={session.teacherName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-base leading-none">{session.teacherName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-5">
                              {session.grade}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                              {session.type === 'recurring' ? <Repeat className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
                              {session.type === 'recurring' ? 'أسبوعية' : 'فردية'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                        <Clock className="h-3 w-3" />
                        <span>
                          {session.type === 'recurring'
                            ? `${formatArabicTime(session.sessionTime ? `2000-01-01T${session.sessionTime}` : undefined)}`
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
