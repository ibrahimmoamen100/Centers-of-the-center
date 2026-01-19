import { useState, useEffect } from "react";
import { Search, Calendar, CreditCard, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
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
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Center {
  id: string;
  name: string;
  subscription: {
    amount: number;
    startDate: string;
    endDate: string;
    status: "active" | "expired" | "pending";
    paymentType?: string;
  };
  operationsUsed: number;
  operationsLimit: number;
  status?: "active" | "expired" | "pending";
}

export function SubscriptionsManagement() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog State
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [renewForm, setRenewForm] = useState({ durationMonths: 1, amount: 300, paymentType: "cash" });

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "centers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Center));
      setCenters(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("فشل تحميل بيانات الاشتراكات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleRenew = async () => {
    if (!selectedCenter) return;

    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + (renewForm.durationMonths * 30));

      await updateDoc(doc(db, "centers", selectedCenter.id), {
        status: "active",
        "subscription.status": "active",
        "subscription.startDate": now.toISOString(),
        "subscription.endDate": endDate.toISOString(),
        "subscription.amount": renewForm.amount,
        "subscription.paymentType": renewForm.paymentType,
        operationsUsed: 0,
        operationsLimit: 10
      });

      toast.success("تم تجديد الاشتراك بنجاح");
      setIsRenewDialogOpen(false);
      fetchCenters();
    } catch (error) {
      console.error(error);
      toast.error("فشل التجديد");
    }
  };

  const filteredCenters = centers.filter((center) => {
    const matchesSearch = center.name?.includes(searchQuery);
    const subStatus = center.subscription?.status || "pending";
    const matchesStatus = statusFilter === "all" || subStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1"><CheckCircle className="h-3 w-3" /> نشط</Badge>;
      case "expired":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 gap-1"><AlertCircle className="h-3 w-3" /> منتهي</Badge>;
      case "pending":
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 gap-1"><Clock className="h-3 w-3" /> معلق</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  // Stats Calculation
  const activeCount = centers.filter(c => c.subscription?.status === "active").length;
  const expiredCount = centers.filter(c => c.subscription?.status === "expired" || c.status === "expired").length;
  const pendingCount = centers.filter(c => !c.subscription?.status || c.subscription?.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">اشتراكات نشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">اشتراكات منتهية</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{expiredCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">في انتظار الدفع</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{pendingCount}</div></CardContent>
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
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
            ) : filteredCenters.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد بيانات</TableCell></TableRow>
            ) : (
              filteredCenters.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>{center.subscription?.amount || 0} ج.م</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(center.subscription?.startDate)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(center.subscription?.endDate)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{center.subscription?.paymentType || "-"}</TableCell>
                  <TableCell>{getStatusBadge(center.subscription?.status || "pending")}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={center.subscription?.status === "active" ? "outline" : "default"}
                      onClick={() => {
                        setSelectedCenter(center);
                        setRenewForm({ ...renewForm, amount: center.subscription?.amount || 300 });
                        setIsRenewDialogOpen(true);
                      }}
                      className="gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      {center.subscription?.status === "pending" ? "تفعيل" : "تجديد"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Renew Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCenter?.subscription?.status === "pending" ? "تفعيل الاشتراك" : "تجديد الاشتراك"}</DialogTitle>
            <DialogDescription>تجديد اشتراك لمركز: {selectedCenter?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>مدة الاشتراك (أشهر)</Label>
              <Select value={renewForm.durationMonths.toString()} onValueChange={(v) => setRenewForm({ ...renewForm, durationMonths: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 شهر</SelectItem>
                  <SelectItem value="3">3 أشهر</SelectItem>
                  <SelectItem value="6">6 أشهر</SelectItem>
                  <SelectItem value="12">سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>قيمة الاشتراك</Label>
              <Input type="number" value={renewForm.amount} onChange={(e) => setRenewForm({ ...renewForm, amount: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select value={renewForm.paymentType} onValueChange={(v) => setRenewForm({ ...renewForm, paymentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي (Cash)</SelectItem>
                  <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleRenew}>تأكيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
