import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  const [centerData, setCenterData] = useState<any>(null); // Using any for flexibility or define proper interface

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/center/login");
        return;
      }

      try {
        const docRef = doc(db, "centers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Map Firestore data to Component expected structure
          setCenterData({
            name: data.centerName,
            logo: null, // Handle logo if stored
            operationsUsed: data.operationsUsed ?? 0,
            operationsLimit: data.operationsLimit ?? 10,
            subscription: data.subscription ?? {
              status: "inactive",
              amount: 0,
              startDate: "",
              endDate: "",
            }
          });
        } else {
          toast.error("لم يتم العثور على بيانات المركز");
        }
      } catch (error) {
        console.error("Error fetching center data:", error);
        toast.error("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!centerData) return null;

  const remainingOperations = centerData.operationsLimit - centerData.operationsUsed;
  const canPerformOperations = remainingOperations > 0;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CenterOverview centerData={centerData} />;
      case "teachers":
        return <TeachersManagement canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "sessions":
        return <SessionsManagement canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "timetable":
        return <TimetableManagement canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "settings":
        return <CenterSettings canEdit={canPerformOperations} remainingOps={remainingOperations} />;
      case "subscription":
        return <SubscriptionInfo subscription={centerData.subscription} />;
      default:
        return <CenterOverview centerData={centerData} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CenterSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          centerName={centerData.name}
          remainingOperations={remainingOperations}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
