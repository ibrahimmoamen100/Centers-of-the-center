import { Building2, Users, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function ReportsSection() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, 'centers'));
        setCenters(snap.docs.map(d => ({ ...d.data(), createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  // Real Calculations
  const totalCenters = centers.length;
  const activeCenters = centers.filter(c => c.status === 'active').length;

  // Calculate revenue from active subscriptions (Approximate MRR)
  const currentRevenue = centers.reduce((sum, c) => {
    if (c.subscription?.status === 'active') {
      return sum + (Number(c.subscription.amount) || 0);
    }
    return sum;
  }, 0);

  // New centers this month (mock logic for "change" percentage as we don't have historical snapshots)
  // But we can check createdAt
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newCentersCount = centers.filter(c => c.createdAt >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="year">هذا العام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المراكز</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCenters}</div>
            <p className="text-xs text-muted-foreground mt-1">+{newCentersCount} هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المراكز النشطة</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCenters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الإيرادات الحالية (المتوقعة)</CardTitle>
            <CreditCard className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{currentRevenue.toLocaleString()} ج.م</div>
            <p className="text-xs text-muted-foreground mt-1">بناءً على الاشتراكات النشطة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>بيانات تفصيلية</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            لا تتوفر بيانات تاريخية كافية لرسم الرسوم البيانية حالياً.
            <br />سيتم تفعيل الرسوم البيانية تلقائياً عند توفر بيانات في الأشهر القادمة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
