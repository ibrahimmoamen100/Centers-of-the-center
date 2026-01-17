import { useState } from "react";
import { Plus, Edit, Trash2, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  image: string | null;
  phone: string;
}

interface TeachersManagementProps {
  canEdit: boolean;
  remainingOps: number;
}

const subjects = [
  "الرياضيات",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التاريخ",
  "الجغرافيا",
];

export function TeachersManagement({ canEdit, remainingOps }: TeachersManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "1", name: "أ/ محمد أحمد", subject: "الرياضيات", image: null, phone: "01012345678" },
    { id: "2", name: "أ/ علي حسن", subject: "الفيزياء", image: null, phone: "01112345678" },
    { id: "3", name: "أ/ أحمد محمود", subject: "الكيمياء", image: null, phone: "01212345678" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subject: "",
    phone: "",
  });

  const handleAdd = () => {
    if (!canEdit) return;
    const teacher: Teacher = {
      id: Date.now().toString(),
      name: newTeacher.name,
      subject: newTeacher.subject,
      image: null,
      phone: newTeacher.phone,
    };
    setTeachers([...teachers, teacher]);
    setNewTeacher({ name: "", subject: "", phone: "" });
    setIsAddOpen(false);
  };

  const handleEdit = () => {
    if (!canEdit || !editingTeacher) return;
    setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
    setEditingTeacher(null);
  };

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    setTeachers(teachers.filter(t => t.id !== id));
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مدرس جديد</DialogTitle>
              <DialogDescription>أدخل بيانات المدرس الجديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم المدرس</Label>
                <Input
                  placeholder="أ/ محمد أحمد"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                />
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
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{teacher.name}</h3>
                  <Badge variant="secondary" className="mt-1">{teacher.subject}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">{teacher.phone}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      disabled={!canEdit}
                      onClick={() => setEditingTeacher(teacher)}
                    >
                      <Edit className="h-3 w-3" />
                      تعديل
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تعديل بيانات المدرس</DialogTitle>
                    </DialogHeader>
                    {editingTeacher && (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>اسم المدرس</Label>
                          <Input
                            value={editingTeacher.name}
                            onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                          />
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
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>رقم الهاتف</Label>
                          <Input
                            value={editingTeacher.phone}
                            onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingTeacher(null)}>إلغاء</Button>
                      <Button onClick={handleEdit}>حفظ التغييرات</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

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
    </div>
  );
}
