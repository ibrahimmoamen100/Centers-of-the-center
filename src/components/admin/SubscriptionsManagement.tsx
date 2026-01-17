import { useState } from "react";
import { Search, Calendar, CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subscription {
  id: string;
  centerName: string;
  centerId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "pending";
  paymentMethod: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: "sub1",
    centerName: "مركز النور التعليمي",
    centerId: "1",
    amount: 300,
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    status: "active",
    paymentMethod: "تحويل بنكي",
  },
  {
    id: "sub2",
    centerName: "مركز الفجر للتعليم",
    centerId: "2",
    amount: 300,
    startDate: "2024-01-28",
    endDate: "2024-02-28",
    status: "active",
    paymentMethod: "فودافون كاش",
  },
  {
    id: "sub3",
    centerName: "مركز العلم والنور",
    centerId: "3",
    amount: 300,
    startDate: "2023-12-10",
    endDate: "2024-01-10",
    status: "expired",
    paymentMethod: "نقدي",
  },
  {
    id: "sub4",
    centerName: "أكاديمية المستقبل",
    centerId: "5",
    amount: 300,
    startDate: "",
    endDate: "",
    status: "pending",
    paymentMethod: "-",
  },
];

export function SubscriptionsManagement() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.centerName.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            نشط
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            منتهي
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 gap-1">
            <Clock className="h-3 w-3" />
            معلق
          </Badge>
        );
    }
  };

  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const expiredCount = subscriptions.filter(s => s.status === "expired").length;
  const pendingCount = subscriptions.filter(s => s.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              اشتراكات نشطة
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              اشتراكات منتهية
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في انتظار الدفع
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم المركز..."
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
            <SelectItem value="pending">معلق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المركز</TableHead>
              <TableHead className="text-right">قيمة الاشتراك</TableHead>
              <TableHead className="text-right hidden md:table-cell">تاريخ البداية</TableHead>
              <TableHead className="text-right hidden md:table-cell">تاريخ الانتهاء</TableHead>
              <TableHead className="text-right hidden lg:table-cell">طريقة الدفع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right w-[120px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.centerName}</TableCell>
                <TableCell>{sub.amount} ج.م</TableCell>
                <TableCell className="hidden md:table-cell">
                  {sub.startDate || "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {sub.endDate || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{sub.paymentMethod}</TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={sub.status === "active" ? "outline" : "default"}
                    onClick={() => {
                      setSelectedSubscription(sub);
                      setIsRenewDialogOpen(true);
                    }}
                    className="gap-1"
                  >
                    <CreditCard className="h-3 w-3" />
                    {sub.status === "pending" ? "تفعيل" : "تجديد"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Renew/Activate Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription?.status === "pending" ? "تفعيل الاشتراك" : "تجديد الاشتراك"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription?.centerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>قيمة الاشتراك</Label>
              <Input defaultValue="300" type="number" />
            </div>
            <div className="space-y-2">
              <Label>تاريخ البداية</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                  <SelectItem value="vodafone">فودافون كاش</SelectItem>
                  <SelectItem value="instapay">انستاباي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setIsRenewDialogOpen(false)}>
              <Calendar className="h-4 w-4 ml-2" />
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
