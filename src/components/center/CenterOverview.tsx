import { Users, Clock, Calendar, Eye, TrendingUp, AlertCircle, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatArabicDateTime, formatArabicDate } from "@/lib/dateUtils";

interface CenterOverviewProps {
  centerData: {
    id: string;
    name: string;
    logo?: string;
    operationsUsed: number;
    operationsLimit: number;
    subscription: {
      status: "active" | "expired" | "suspended";
      startDate?: string;
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

  const remainingOperations = centerData.operationsLimit - centerData.operationsUsed;

  const stats = [
    { title: "المدرسين", value: counts.teachers, icon: Users, color: "text-blue-600" },
    { title: "الحصص المسجلة", value: counts.sessions, icon: Clock, color: "text-green-600" },
    {
      title: "استهلاك العمليات",
      value: `${centerData.operationsUsed} / ${centerData.operationsLimit}`,
      subValue: `المتبقي: ${remainingOperations}`,
      icon: Calendar,
      color: remainingOperations < 3 ? "text-destructive" : "text-purple-600"
    },
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

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex items-center gap-4">
        {centerData.logo && (
          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0">
            <img
              src={centerData.logo}
              alt={centerData.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">مرحبًا بك في لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة مركزك التعليمي بسهولة</p>
        </div>
      </div>

      {/* Alerts */}
      {remainingOperations <= 3 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                {remainingOperations <= 0
                  ? "انتهت العمليات المتاحة"
                  : `تنبيه: تبقى ${remainingOperations} عمليات تعديل فقط`}
              </p>
              <p className="text-sm text-muted-foreground">
                يرجى التواصل مع الإدارة لتجديد الباقة أو زيادة الحد المسموح.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {stat.subValue && (
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.subValue}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Status - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              حالة الاشتراك
              {getStatusBadge(centerData.subscription.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {centerData.subscription.startDate && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ البداية</span>
                </div>
                <p className="font-medium text-lg">
                  {formatArabicDateTime(centerData.subscription.startDate)}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>تاريخ الانتهاء</span>
              </div>
              <p className="font-medium text-lg">
                {formatArabicDateTime(centerData.subscription.endDate)}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
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
