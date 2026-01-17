import { useState } from "react";
import { Search, Download, CheckCircle, XCircle, Clock } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentLog {
  id: string;
  centerName: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "pending" | "failed";
  receiptNumber: string;
  notes: string;
}

const mockPayments: PaymentLog[] = [
  {
    id: "pay1",
    centerName: "مركز النور التعليمي",
    amount: 300,
    date: "2024-02-15",
    method: "تحويل بنكي",
    status: "completed",
    receiptNumber: "REC-2024-001",
    notes: "تجديد الاشتراك الشهري",
  },
  {
    id: "pay2",
    centerName: "مركز الفجر للتعليم",
    amount: 300,
    date: "2024-02-14",
    method: "فودافون كاش",
    status: "completed",
    receiptNumber: "REC-2024-002",
    notes: "اشتراك جديد",
  },
  {
    id: "pay3",
    centerName: "أكاديمية المستقبل",
    amount: 300,
    date: "2024-02-13",
    method: "انستاباي",
    status: "pending",
    receiptNumber: "-",
    notes: "في انتظار التأكيد",
  },
  {
    id: "pay4",
    centerName: "مركز العلم والنور",
    amount: 300,
    date: "2024-02-10",
    method: "تحويل بنكي",
    status: "failed",
    receiptNumber: "-",
    notes: "فشل التحويل - بيانات خاطئة",
  },
  {
    id: "pay5",
    centerName: "مركز التفوق",
    amount: 300,
    date: "2024-02-08",
    method: "نقدي",
    status: "completed",
    receiptNumber: "REC-2024-003",
    notes: "دفع نقدي في المقر",
  },
  {
    id: "pay6",
    centerName: "مركز الأمل التعليمي",
    amount: 300,
    date: "2024-02-05",
    method: "فودافون كاش",
    status: "completed",
    receiptNumber: "REC-2024-004",
    notes: "تجديد الاشتراك",
  },
];

export function PaymentLogs() {
  const [payments] = useState<PaymentLog[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.centerName.includes(searchQuery) || payment.receiptNumber.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: PaymentLog["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            مكتمل
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 gap-1">
            <Clock className="h-3 w-3" />
            معلق
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 gap-1">
            <XCircle className="h-3 w-3" />
            فشل
          </Badge>
        );
    }
  };

  const totalCompleted = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المدفوعات المكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCompleted.toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في انتظار التأكيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalPending.toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عدد المعاملات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث باسم المركز أو رقم الإيصال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="failed">فشل</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="طريقة الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الطرق</SelectItem>
              <SelectItem value="نقدي">نقدي</SelectItem>
              <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
              <SelectItem value="فودافون كاش">فودافون كاش</SelectItem>
              <SelectItem value="انستاباي">انستاباي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* Payments Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المركز</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right hidden md:table-cell">التاريخ</TableHead>
              <TableHead className="text-right hidden lg:table-cell">طريقة الدفع</TableHead>
              <TableHead className="text-right hidden lg:table-cell">رقم الإيصال</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right hidden xl:table-cell">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.centerName}</TableCell>
                <TableCell>{payment.amount} ج.م</TableCell>
                <TableCell className="hidden md:table-cell">{payment.date}</TableCell>
                <TableCell className="hidden lg:table-cell">{payment.method}</TableCell>
                <TableCell className="hidden lg:table-cell font-mono text-sm">
                  {payment.receiptNumber}
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="hidden xl:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                  {payment.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
