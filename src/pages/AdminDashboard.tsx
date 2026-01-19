import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CentersManagement } from "@/components/admin/CentersManagement";
import { ReportsSection } from "@/components/admin/ReportsSection";

export type AdminSection = "centers" | "reports";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("centers");

  const renderSection = () => {
    switch (activeSection) {
      case "centers":
        return <CentersManagement />;
      case "reports":
        return <ReportsSection />;
      default:
        return <CentersManagement />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-foreground">
              {activeSection === "centers" && "إدارة المراكز"}
              {activeSection === "reports" && "التقارير والإحصائيات"}
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
