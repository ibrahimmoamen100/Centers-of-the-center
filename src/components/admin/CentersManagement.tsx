import { useState } from "react";
import { Search, Plus, MoreVertical, Eye, Edit, Archive, Trash2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Center {
  id: string;
  name: string;
  phone: string;
  address: string;
  stage: string;
  status: "active" | "archived" | "expired";
  subscriptionEnd: string;
  studentsCount: number;
}

const mockCenters: Center[] = [
  {
    id: "1",
    name: "مركز النور التعليمي",
    phone: "01012345678",
    address: "شارع التحرير، القاهرة",
    stage: "الإعدادية",
    status: "active",
    subscriptionEnd: "2024-03-15",
    studentsCount: 150,
  },
  {
    id: "2",
    name: "مركز الفجر للتعليم",
    phone: "01098765432",
    address: "المنصورة، الدقهلية",
    stage: "الثانوية",
    status: "active",
    subscriptionEnd: "2024-02-28",
    studentsCount: 200,
  },
  {
    id: "3",
    name: "مركز العلم والنور",
    phone: "01155544433",
    address: "طنطا، الغربية",
    stage: "الإعدادية والثانوية",
    status: "expired",
    subscriptionEnd: "2024-01-10",
    studentsCount: 80,
  },
  {
    id: "4",
    name: "مركز التفوق",
    phone: "01222333444",
    address: "الإسكندرية",
    stage: "الثانوية",
    status: "archived",
    subscriptionEnd: "2023-12-01",
    studentsCount: 0,
  },
];

export function CentersManagement() {
  const [centers, setCenters] = useState<Center[]>(mockCenters);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.name.includes(searchQuery) ||
      center.phone.includes(searchQuery) ||
      center.address.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || center.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Center["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">نشط</Badge>;
      case "expired":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">منتهي</Badge>;
      case "archived":
        return <Badge className="bg-muted text-muted-foreground">مؤرشف</Badge>;
    }
  };

  const handleArchive = (center: Center) => {
    setCenters(centers.map(c => 
      c.id === center.id ? { ...c, status: "archived" as const } : c
    ));
  };

  const handleRestore = (center: Center) => {
    setCenters(centers.map(c => 
      c.id === center.id ? { ...c, status: "active" as const } : c
    ));
  };

  const handleDelete = () => {
    if (selectedCenter) {
      setCenters(centers.filter(c => c.id !== selectedCenter.id));
      setIsDeleteDialogOpen(false);
      setSelectedCenter(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الهاتف أو العنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="expired">منتهي</SelectItem>
              <SelectItem value="archived">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مركز
        </Button>
      </div>

      {/* Centers Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم المركز</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right hidden md:table-cell">المرحلة</TableHead>
              <TableHead className="text-right hidden lg:table-cell">انتهاء الاشتراك</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right w-[70px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCenters.map((center) => (
              <TableRow key={center.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{center.name}</p>
                    <p className="text-sm text-muted-foreground">{center.address}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{center.phone}</TableCell>
                <TableCell className="hidden md:table-cell">{center.stage}</TableCell>
                <TableCell className="hidden lg:table-cell">{center.subscriptionEnd}</TableCell>
                <TableCell>{getStatusBadge(center.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => {
                          setSelectedCenter(center);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {center.status === "archived" ? (
                        <DropdownMenuItem 
                          className="gap-2 text-green-600"
                          onClick={() => handleRestore(center)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          استعادة
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="gap-2 text-amber-600"
                          onClick={() => handleArchive(center)}
                        >
                          <Archive className="h-4 w-4" />
                          أرشفة
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="gap-2 text-destructive"
                        onClick={() => {
                          setSelectedCenter(center);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف نهائي
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Center Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مركز جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المركز التعليمي الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المركز</Label>
              <Input id="name" placeholder="مثال: مركز النور التعليمي" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" placeholder="01xxxxxxxxx" className="text-left" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Input id="address" placeholder="المحافظة، المنطقة، الشارع" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">المرحلة الدراسية</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المرحلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prep">الإعدادية</SelectItem>
                  <SelectItem value="sec">الثانوية</SelectItem>
                  <SelectItem value="both">الإعدادية والثانوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف المركز</Label>
              <Textarea id="description" placeholder="وصف مختصر عن المركز..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>
              إضافة المركز
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Center Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المركز</DialogTitle>
            <DialogDescription>
              تعديل بيانات: {selectedCenter?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم المركز</Label>
              <Input id="edit-name" defaultValue={selectedCenter?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input id="edit-phone" defaultValue={selectedCenter?.phone} className="text-left" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">العنوان</Label>
              <Input id="edit-address" defaultValue={selectedCenter?.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stage">المرحلة الدراسية</Label>
              <Select defaultValue={selectedCenter?.stage === "الإعدادية" ? "prep" : selectedCenter?.stage === "الثانوية" ? "sec" : "both"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prep">الإعدادية</SelectItem>
                  <SelectItem value="sec">الثانوية</SelectItem>
                  <SelectItem value="both">الإعدادية والثانوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف مركز "{selectedCenter?.name}" نهائياً؟
              <br />
              <span className="text-destructive font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
