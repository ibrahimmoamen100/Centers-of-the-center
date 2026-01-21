import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BadgeAlert, AlertTriangle, Upload, User } from "lucide-react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Teacher {
  id: string;
  name: string;
  subject: string;
  grade: string; // الصف الدراسي
  image?: string;
  bio?: string;
  phone: string;
}

interface TeachersManagementProps {
  canEdit: boolean;
  remainingOps: number;
  centerId: string;
}

export function TeachersManagement({ canEdit, remainingOps, centerId }: TeachersManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [centerSubjects, setCenterSubjects] = useState<string[]>([]);
  const [centerGrades, setCenterGrades] = useState<string[]>([]); // الصفوف الدراسية

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form States
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subject: "",
    grade: "", // الصف الدراسي
    phone: "",
    bio: "",
    image: "",
  });

  // Fetch center data to get subjects and grades
  useEffect(() => {
    const fetchCenterData = async () => {
      try {
        const centerDoc = await getDoc(doc(db, "centers", centerId));
        if (centerDoc.exists()) {
          const data = centerDoc.data();
          setCenterSubjects(data.subjects || []);
          setCenterGrades(data.grades || []); // جلب الصفوف الدراسية
        }
      } catch (error) {
        console.error("Error fetching center data:", error);
      }
    };
    fetchCenterData();
  }, [centerId]);

  useEffect(() => {
    fetchTeachers();
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
      toast.error("فشل تحميل قائمة المدرسين");
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
    try {
      const docRef = await addDoc(collection(db, "centers", centerId, "teachers"), {
        name: newTeacher.name,
        subject: newTeacher.subject,
        grade: newTeacher.grade, // حفظ الصف الدراسي
        phone: newTeacher.phone,
        bio: newTeacher.bio || "",
        image: newTeacher.image || ""
      });

      const teacher: Teacher = {
        id: docRef.id,
        name: newTeacher.name,
        subject: newTeacher.subject,
        grade: newTeacher.grade, // إضافة الصف الدراسي
        phone: newTeacher.phone,
        bio: newTeacher.bio,
        image: newTeacher.image
      };

      setTeachers([...teachers, teacher]);
      setNewTeacher({ name: "", subject: "", grade: "", phone: "", bio: "", image: "" });
      setIsAddOpen(false);
      updateOperations();
      toast.success("تم إضافة المدرس بنجاح");
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("فشل إضافة المدرس");
    }
  };

  const handleEdit = async () => {
    if (!canEdit || !editingTeacher) return;
    try {
      const teacherRef = doc(db, "centers", centerId, "teachers", editingTeacher.id);
      await updateDoc(teacherRef, {
        name: editingTeacher.name,
        subject: editingTeacher.subject,
        grade: editingTeacher.grade, // تحديث الصف الدراسي
        phone: editingTeacher.phone,
        bio: editingTeacher.bio || "",
        image: editingTeacher.image || ""
      });

      setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
      setIsEditOpen(false);
      setEditingTeacher(null);
      updateOperations();
      toast.success("تم تعديل البيانات بنجاح");
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("فشل تحديث البيانات");
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    try {
      await deleteDoc(doc(db, "centers", centerId, "teachers", id));
      setTeachers(teachers.filter(t => t.id !== id));
      updateOperations();
      toast.success("تم حذف المدرس بنجاح");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("فشل حذف المدرس");
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المدرسين</h1>
          <p className="text-muted-foreground">إضافة وتعديل بيانات المدرسين</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canEdit} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة مدرس
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة مدرس جديد</DialogTitle>
              <DialogDescription>أدخل بيانات المدرس الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Image Input */}
              <div className="space-y-2">
                <Label>صورة المدرس (رابط URL)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border flex items-center justify-center overflow-hidden bg-muted flex-shrink-0">
                    {newTeacher.image ? (
                      <img src={newTeacher.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newTeacher.image}
                    onChange={(e) => setNewTeacher({ ...newTeacher, image: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المدرس</Label>
                  <Input
                    placeholder="أ/ محمد أحمد"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    placeholder="01xxxxxxxxx"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>المادة</Label>
                <Select
                  value={newTeacher.subject}
                  onValueChange={(value) => setNewTeacher({ ...newTeacher, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {centerSubjects.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">لا توجد مواد مسجلة للمركز</div>
                    ) : (
                      centerSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الصف الدراسي الذي يدرسه</Label>
                <Select
                  value={newTeacher.grade}
                  onValueChange={(value) => setNewTeacher({ ...newTeacher, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    {centerGrades.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">لا توجد صفوف مسجلة للمركز</div>
                    ) : (
                      centerGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>نبذة عن المدرس (اختياري)</Label>
                <Textarea
                  placeholder="نبذة مختصرة عن خبرات ومؤهلات المدرس..."
                  value={newTeacher.bio}
                  onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })}
                  rows={3}
                />
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

      {isLoading ? <div className="text-center py-10">جاري التحميل...</div> : teachers.length === 0 ? <div className="text-center py-10 text-muted-foreground">لا يوجد مدرسين مسجلين</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
                    {teacher.image ? (
                      <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      teacher.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{teacher.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="secondary">{teacher.subject}</Badge>
                      {teacher.grade && (
                        <Badge variant="outline" className="text-xs">{teacher.grade}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{teacher.phone}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    disabled={!canEdit}
                    onClick={() => openEditDialog(teacher)}
                  >
                    <Edit className="h-3 w-3" />
                    تعديل
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={!canEdit}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف المدرس</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف {teacher.name}؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(teacher.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog - Moved outside loop to fix stacking/modal issues */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المدرس</DialogTitle>
          </DialogHeader>
          {editingTeacher && (
            <div className="space-y-4 py-4">
              {/* Image Input for Edit */}
              <div className="space-y-2">
                <Label>صورة المدرس (رابط URL)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border flex items-center justify-center overflow-hidden bg-muted flex-shrink-0">
                    {editingTeacher.image ? (
                      <img src={editingTeacher.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={editingTeacher.image || ""}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, image: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المدرس</Label>
                  <Input
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>المادة</Label>
                <Select
                  value={editingTeacher.subject}
                  onValueChange={(value) => setEditingTeacher({ ...editingTeacher, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {centerSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الصف الدراسي الذي يدرسه</Label>
                <Select
                  value={editingTeacher.grade}
                  onValueChange={(value) => setEditingTeacher({ ...editingTeacher, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    {centerGrades.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">لا توجد صفوف مسجلة للمركز</div>
                    ) : (
                      centerGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>نبذة عن المدرس (اختياري)</Label>
                <Textarea
                  placeholder="نبذة مختصرة عن خبرات ومؤهلات المدرس..."
                  value={editingTeacher.bio || ""}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleEdit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
