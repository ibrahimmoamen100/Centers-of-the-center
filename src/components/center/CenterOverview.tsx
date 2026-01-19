import { Users, Clock, Calendar, Eye, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CenterOverviewProps {
  centerData: {
    id: string; // Added id
    name: string;
    operationsUsed: number;
    operationsLimit: number;
    subscription: {
      status: "active" | "expired" | "suspended";
      endDate: string;
    };
  };
}

export function CenterOverview({ centerData }: CenterOverviewProps) {
  const [counts, setCounts] = useState({ teachers: 0, sessions: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const teachersColl = collection(db, "centers", centerData.id, "teachers");
        const sessionsColl = collection(db, "centers", centerData.id, "sessions");

        const teachersSnapshot = await getCountFromServer(teachersColl);
        const sessionsSnapshot = await getCountFromServer(sessionsColl);

        setCounts({
          teachers: teachersSnapshot.data().count,
          sessions: sessionsSnapshot.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchCounts();
  }, [centerData.id]);

  const stats = [
    { title: "المدرسين", value: counts.teachers, icon: Users, color: "text-blue-600" },
    { title: "الحصص المسجلة", value: counts.sessions, icon: Clock, color: "text-green-600" },
    { title: "العمليات المستهلكة", value: centerData.operationsUsed, icon: Calendar, color: "text-purple-600" },
    { title: "التقييم العام", value: 0, icon: Eye, color: "text-accent" }, // Placeholder for now
  ];

  const recentActivity = [
    // Placeholder, ideally we have an 'activities' collection
    { action: "تم تسجيل الدخول", teacher: "النظام", time: "الآن" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case "expired":
        return <Badge variant="destructive">منتهي</Badge>;
      case "suspended":
        return <Badge variant="secondary">موقوف</Badge>;
      default:
        return null;
    }
  };

  const remainingOperations = centerData.operationsLimit - centerData.operationsUsed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مرحبًا بك في لوحة التحكم</h1>
        <p className="text-muted-foreground">إدارة مركزك التعليمي بسهولة</p>
      </div>

      {/* Alerts */}
      {remainingOperations <= 3 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                {remainingOperations === 0
                  ? "انتهت العمليات المتاحة"
                  : `تبقى ${remainingOperations} عمليات فقط`}
              </p>
              <p className="text-sm text-muted-foreground">
                جدد اشتراكك للحصول على المزيد من العمليات
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              حالة الاشتراك
              {getStatusBadge(centerData.subscription.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">تاريخ الانتهاء</span>
              <span className="font-medium">{centerData.subscription.endDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">العمليات المستخدمة</span>
              <span className="font-medium">{centerData.operationsUsed} / {centerData.operationsLimit}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${remainingOperations <= 3 ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${(centerData.operationsUsed / centerData.operationsLimit) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.teacher}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
