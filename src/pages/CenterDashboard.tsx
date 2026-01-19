import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CenterSidebar } from "@/components/center/CenterSidebar";
import { CenterOverview } from "@/components/center/CenterOverview";
import { TeachersManagement } from "@/components/center/TeachersManagement";
import { SessionsManagement } from "@/components/center/SessionsManagement";
import { TimetableManagement } from "@/components/center/TimetableManagement";
import { CenterSettings } from "@/components/center/CenterSettings";
import { SubscriptionInfo } from "@/components/center/SubscriptionInfo";

export type CenterTab = "overview" | "teachers" | "sessions" | "timetable" | "settings" | "subscription";

export default function CenterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CenterTab>("overview");
  const [loading, setLoading] = useState(true);
  const [centerData, setCenterData] = useState<any>(null);

  useEffect(() => {
    let snapshotUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/center/login");
        return;
      }

      try {
        const docRef = doc(db, "centers", user.uid);

        // Use onSnapshot for real-time updates
        snapshotUnsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            // Check expiration
            const now = new Date();
            const endDate = data.subscription?.endDate ? new Date(data.subscription.endDate) : null;
            const isExpired = endDate && endDate < now;
            const subStatus = isExpired ? 'expired' : (data.subscription?.status || 'inactive');

            // Normalize Data
            setCenterData({
              ...data, // Include all other properties from the document
              id: user.uid,
              name: data.name || data.centerName || "المركز التعليمي",
              logo: data.logo || null,
              operationsUsed: data.operationsUsed || 0,
              operationsLimit: data.operationsLimit || 10,
              subscription: {
                ...(data.subscription || {}),
                status: subStatus
              }
            });
          } else {
            toast.error("لم يتم العثور على بيانات المركز");
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching center data realtime:", error);
          toast.error("حدث خطأ أثناء جلب البيانات");
          setLoading(false);
        });

      } catch (error) {
        console.error("Error setting up listener:", error);
        toast.error("فشل الاتصال بقاعدة البيانات");
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (snapshotUnsubscribe) snapshotUnsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!centerData) return null;

  // Logic: Block edits if limit reached OR subscription expired
  const remainingOperations = (centerData.operationsLimit || 10) - (centerData.operationsUsed || 0);
  const isSubscriptionActive = centerData.subscription?.status === 'active';

  // Can perform operations ONLY if active AND has remaining credits
  const canPerformOperations = isSubscriptionActive && remainingOperations > 0;

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <CenterSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          centerName={centerData.name}
          remainingOperations={remainingOperations}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {!isSubscriptionActive && (
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
