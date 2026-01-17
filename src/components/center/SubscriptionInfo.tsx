import { CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SubscriptionInfoProps {
  subscription: {
    status: "active" | "expired" | "suspended";
    amount: number;
    startDate: string;
    endDate: string;
  };
}

export function SubscriptionInfo({ subscription }: SubscriptionInfoProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "نشط",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
        };
      case "expired":
        return {
          label: "منتهي",
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/20",
        };
      case "suspended":
        return {
          label: "موقوف",
          icon: AlertTriangle,
          color: "text-amber-600",
          bgColor: "bg-amber-100",
          borderColor: "border-amber-200",
        };
      default:
        return {
          label: "غير معروف",
          icon: AlertTriangle,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
        };
    }
  };

  const statusInfo = getStatusInfo(subscription.status);
  const StatusIcon = statusInfo.icon;

  const paymentHistory = [
    { date: "2024-01-01", amount: 300, status: "paid" },
    { date: "2023-12-01", amount: 300, status: "paid" },
    { date: "2023-11-01", amount: 300, status: "paid" },
    { date: "2023-10-01", amount: 300, status: "paid" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الاشتراك</h1>
        <p className="text-muted-foreground">معلومات الاشتراك وسجل المدفوعات</p>
      </div>

      {/* Current Subscription Status */}
      <Card className={`border-2 ${statusInfo.borderColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${statusInfo.bgColor}`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">حالة الاشتراك</h2>
                <Badge className={`${statusInfo.bgColor} ${statusInfo.color} mt-1`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            
            {subscription.status !== "active" && (
              <Button className="gap-2">
                <CreditCard className="h-4 w-4" />
                تجديد الاشتراك
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">قيمة الاشتراك</p>
                <p className="font-bold text-lg">{subscription.amount} ج.م / شهر</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                <p className="font-bold">{subscription.startDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                <p className="font-bold">{subscription.endDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>مميزات الاشتراك</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "ظهور المركز في نتائج البحث",
              "صفحة عرض خاصة بالمركز",
              "إضافة المدرسين والحصص",
              "جدول حصص تفاعلي",
              "10 عمليات تعديل شهريًا",
              "الدعم الفني",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">دفعة اشتراك شهري</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-green-600">{payment.amount} ج.م</p>
                  <Badge variant="secondary" className="text-xs">مدفوع</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact for Payment */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2">لتجديد الاشتراك</h3>
          <p className="text-muted-foreground mb-4">
            تواصل معنا عبر الواتساب أو قم بالتحويل البنكي
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="gap-2">
              واتساب: 01012345678
            </Button>
            <Button className="gap-2">
              <CreditCard className="h-4 w-4" />
              طلب فاتورة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
