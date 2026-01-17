import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CentersManagement } from "@/components/admin/CentersManagement";
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement";
import { ReportsSection } from "@/components/admin/ReportsSection";
import { PaymentLogs } from "@/components/admin/PaymentLogs";

export type AdminSection = "centers" | "subscriptions" | "reports" | "payments";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("centers");

  const renderSection = () => {
    switch (activeSection) {
      case "centers":
        return <CentersManagement />;
      case "subscriptions":
        return <SubscriptionsManagement />;
      case "reports":
        return <ReportsSection />;
      case "payments":
        return <PaymentLogs />;
      default:
        return <CentersManagement />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-bold text-foreground">
              {activeSection === "centers" && "إدارة المراكز"}
              {activeSection === "subscriptions" && "إدارة الاشتراكات"}
              {activeSection === "reports" && "التقارير والإحصائيات"}
              {activeSection === "payments" && "سجل المدفوعات"}
            </h1>
          </header>
          
          <div className="flex-1 p-6 overflow-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
