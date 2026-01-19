import { useState, useEffect } from "react";
import { Search, Download, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function PaymentLogs() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const snap = await getDocs(collection(db, 'centers'));
        const logs = snap.docs
          .map(doc => {
            const data = doc.data();
            if (!data.subscription?.startDate) return null;
            return {
              id: doc.id,
              centerName: data.name,
              amount: data.subscription.amount || 0,
              date: data.subscription.startDate,
              method: data.subscription.paymentType || 'غير محدد',
              status: data.subscription.status === 'active' ? 'completed' : 'pending' // Simplified
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setPayments(logs);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchPayments();
  }, []);

  const totalCompleted = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const getStatusBadge = (status: string) => {
    return status === 'completed' ?
      <Badge className="bg-green-500/10 text-green-600 gap-1"><CheckCircle className="h-3 w-3" /> مكتمل</Badge> :
      <Badge className="bg-amber-500/10 text-amber-600 gap-1"><Clock className="h-3 w-3" /> معلق</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المدفوعات المسجلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCompleted.toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">عدد المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المركز</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">تاريخ التفعيل</TableHead>
              <TableHead className="text-right">طريقة الدفع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 opacity-50" />
                  <p>لا توجد سجلات مدفوعات متاحة حالياً</p>
                </div>
              </TableCell></TableRow>
            ) : (
              payments.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.centerName}</TableCell>
                  <TableCell>{log.amount} ج.م</TableCell>
                  <TableCell>{formatDate(log.date)}</TableCell>
                  <TableCell>{log.method}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        ملاحظة: يتم استنتاج السجل أعلاه من تواريخ تفعيل الاشتراكات الحالية.
      </p>
    </div>
  );
}
