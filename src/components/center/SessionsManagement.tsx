import { useState } from "react";
import { Plus, Edit, Trash2, Clock, AlertTriangle } from "lucide-react";
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

interface Session {
  id: string;
  subject: string;
  teacher: string;
  grade: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface SessionsManagementProps {
  canEdit: boolean;
  remainingOps: number;
}

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const subjects = ["الرياضيات", "الفيزياء", "الكيمياء", "الأحياء", "اللغة العربية", "اللغة الإنجليزية"];
const grades = ["الأول الإعدادي", "الثاني الإعدادي", "الثالث الإعدادي", "الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"];
const teachers = ["أ/ محمد أحمد", "أ/ علي حسن", "أ/ أحمد محمود"];

export function SessionsManagement({ canEdit, remainingOps }: SessionsManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", subject: "الرياضيات", teacher: "أ/ محمد أحمد", grade: "الثالث الثانوي", day: "السبت", startTime: "14:00", endTime: "16:00" },
    { id: "2", subject: "الفيزياء", teacher: "أ/ علي حسن", grade: "الثالث الثانوي", day: "الأحد", startTime: "16:00", endTime: "18:00" },
    { id: "3", subject: "الكيمياء", teacher: "أ/ أحمد محمود", grade: "الثاني الثانوي", day: "الاثنين", startTime: "14:00", endTime: "16:00" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: "",
    teacher: "",
    grade: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleAdd = () => {
    if (!canEdit) return;
    const session: Session = {
      id: Date.now().toString(),
      ...newSession,
    };
    setSessions([...sessions, session]);
    setNewSession({ subject: "", teacher: "", grade: "", day: "", startTime: "", endTime: "" });
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    setSessions(sessions.filter(s => s.id !== id));
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المادة</Label>
                  <Select
                    value={newSession.subject}
                    onValueChange={(value) => setNewSession({ ...newSession, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المدرس</Label>
                  <Select
                    value={newSession.teacher}
                    onValueChange={(value) => setNewSession({ ...newSession, teacher: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدرس" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اليوم</Label>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>وقت البداية</Label>
                  <Input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>وقت النهاية</Label>
                  <Input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                  />
                </div>
              </div>
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
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getSubjectColor(session.subject)}>
                          {session.subject}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canEdit}>
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
                      <p className="font-medium">{session.teacher}</p>
                      <p className="text-sm text-muted-foreground">{session.grade}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{session.startTime} - {session.endTime}</span>
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
