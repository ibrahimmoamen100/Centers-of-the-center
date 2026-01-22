import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CenterSidebar } from "@/components/center/CenterSidebar";
import { CenterOverview } from "@/components/center/CenterOverview";
import { TeachersManagement } from "@/components/center/TeachersManagement";
import { SessionsManagement } from "@/components/center/SessionsManagement";
import { TimetableManagement } from "@/components/center/TimetableManagement";
import { CenterSettings } from "@/components/center/CenterSettings";
import { SubscriptionInfo } from "@/components/center/SubscriptionInfo";
import { SEO } from "@/components/common/SEO";
import { useCenterDashboard } from "@/hooks/useCenterDashboard";
import { useCenterDashboardStore } from "@/stores/centerDashboardStore";
import { useEffect } from "react";

export type CenterTab = "overview" | "teachers" | "sessions" | "timetable" | "settings" | "subscription";

export default function CenterDashboard() {
  const navigate = useNavigate();

  // React Query hook for data fetching + real-time updates
  const { isLoading, isAuthenticated, authChecked } = useCenterDashboard();

  // Zustand store for UI state and cached data
  const {
    activeTab,
    setActiveTab,
    centerData,
    remainingOperations,
    canPerformOperations
  } = useCenterDashboardStore();

  // Redirect if not authenticated (only after auth check is complete)
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      navigate("/center/login");
    }
  }, [authChecked, isAuthenticated, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!centerData) return null;

  // isSubscriptionActive is derived from centerData in Zustand store
  const isSubscriptionActive = centerData.subscription?.status === 'active';

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CenterOverview centerData={centerData} />;
      case "teachers":
        return <TeachersManagement centerId={centerData.id} canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "sessions":
        return <SessionsManagement centerId={centerData.id} canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "timetable":
        return <TimetableManagement centerId={centerData.id} canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "settings":
        return <CenterSettings centerData={centerData} canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "subscription":
        return <SubscriptionInfo subscription={centerData.subscription} />;
      default:
        return <CenterOverview centerData={centerData} />;
    }
  };



  return (
    <SidebarProvider defaultOpen>
      <SEO title={`${centerData.name} - لوحة التحكم`} />
      <div className="min-h-screen flex w-full bg-background text-right" dir="rtl">
        <CenterSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          centerName={centerData.name}
          remainingOperations={remainingOperations}
          operationsLimit={centerData.operationsLimit || 10}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Sidebar Trigger for mobile/collapsed state */}
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger />
            </div>

            {/* Pending Approval Warning */}
            {centerData.status === 'pending' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-amber-700">حسابك قيد المراجعة</h3>
                    <p className="text-sm text-amber-700/80 max-w-2xl leading-relaxed">
                      مرحباً بك في منصة مراكزنا. حسابك حالياً في انتظار موافقة المسؤول ولن يظهر للطلاب حتى يتم التفعيل.
                      <br />
                      تفاصيل الاشتراك: <span className="font-bold">300 ج.م شهرياً</span> (يشمل 20 تعديل/شهر).
                      <br />
                      لتفعيل الحساب وزيادة باقة التعديلات، يرجى التواصل مع الإدارة ودفع المستحقات.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Button
                      className="flex-1 md:flex-none gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none"
                      onClick={() => window.open('https://wa.me/201024911062', '_blank')}
                    >
                      <MessageCircle className="h-4 w-4" />
                      تواصل واتساب
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 md:flex-none gap-2 border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                      onClick={() => window.location.href = 'tel:01024911062'}
                    >
                      <Phone className="h-4 w-4" />
                      اتصال هاتفي
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isSubscriptionActive && centerData.status !== 'pending' && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg mb-6 text-center font-bold">
                تنبيه: اشتراك المركز منتهي أو غير مفعل. يرجى التواصل مع الإدارة للتجديد.
              </div>
            )}
            {isSubscriptionActive && remainingOperations <= 0 && (
              <div className="bg-amber-500/10 text-amber-700 border border-amber-500/20 p-4 rounded-lg mb-6 text-center font-bold">
                تنبيه: لقد استهلكت جميع التعديلات المتاحة لهذا الشهر. يرجى التواصل لزيادة الباقة.
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
