import { CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SubscriptionInfoProps {
  subscription: {
    status: "active" | "expired" | "suspended";
    amount: number;
    startDate?: string;
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

  // Formatting dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock payment history logic based on subscription data if available
  const paymentHistory = [
    {
      date: formatDate(subscription.startDate),
      amount: subscription.amount,
      status: "paid",
      method: "Vodafone Cash"
    }
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
              <Button
                className="gap-2 bg-[#25D366] hover:bg-[#25D366]/90"
                onClick={() => window.open('https://wa.me/201024911062', '_blank')}
              >
                <MessageCircle className="h-4 w-4" />
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
                <p className="font-bold">{formatDate(subscription.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                <p className="font-bold">{formatDate(subscription.endDate)}</p>
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
              "20 عملية تعديل شهريًا",
              "الدعم الفني المباشر",
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{payment.date}</span>
                      <span>•</span>
                      <span>{payment.method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-green-600">{payment.amount} ج.م</p>
                  <Badge variant="secondary" className="text-xs">مدفوع</Badge>
                </div>
              </div>
            ))}
            <p className="text-xs text-center text-muted-foreground mt-2">
              يتم عرض آخر عملية دفع فقط حالياً.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact for Payment */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold mb-2">لتجديد الاشتراك أو زيادة الباقة</h3>
            <p className="text-muted-foreground">
              يرجى تحويل مبلغ الحجز على فودافون كاش على الرقم التالي وارسال صورة التحويل لتأكيد الدفع
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 max-w-md mx-auto bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg w-full justify-between">
              <span className="font-bold text-lg ltr font-mono">01024911062</span>
              <span className="text-sm font-medium">Vodafone Cash</span>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                className="flex-1 gap-2 bg-[#25D366] hover:bg-[#25D366]/90"
                onClick={() => window.open('https://wa.me/201024911062', '_blank')}
              >
                <MessageCircle className="h-4 w-4" />
                أرسل التحويل واتساب
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
