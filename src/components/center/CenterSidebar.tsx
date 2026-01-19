import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Settings,
  CreditCard,
  LogOut,
  AlertTriangle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CenterTab } from "@/pages/CenterDashboard";

interface CenterSidebarProps {
  activeTab: CenterTab;
  setActiveTab: (tab: CenterTab) => void;
  centerName: string;
  remainingOperations: number;
}

const menuItems = [
  { id: "overview" as CenterTab, title: "نظرة عامة", icon: LayoutDashboard },
  { id: "teachers" as CenterTab, title: "المدرسين", icon: Users },
  { id: "sessions" as CenterTab, title: "الحصص", icon: Clock },
  { id: "timetable" as CenterTab, title: "الجداول", icon: Calendar },
  { id: "settings" as CenterTab, title: "بيانات المركز", icon: Settings },
  { id: "subscription" as CenterTab, title: "الاشتراك", icon: CreditCard },
];

export function CenterSidebar({ activeTab, setActiveTab, centerName, remainingOperations }: CenterSidebarProps) {
  return (
    <Sidebar side="right" className="border-l">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-primary">{centerName}</h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Operations Warning */}
        <div className="p-4">
          <div className={`rounded-lg p-3 ${remainingOperations <= 3 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
            <div className="flex items-center gap-2 mb-1">
              {remainingOperations <= 3 && <AlertTriangle className="h-4 w-4 text-destructive" />}
              <span className="text-sm font-medium">العمليات المتبقية</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${remainingOperations <= 3 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${(remainingOperations / 10) * 100}%` }}
                />
              </div>
              <Badge variant={remainingOperations <= 3 ? "destructive" : "secondary"}>
                {remainingOperations}/10
              </Badge>
            </div>
            {remainingOperations === 0 && (
              <p className="text-xs text-destructive mt-2">
                انتهت العمليات المتاحة. جدد اشتراكك للاستمرار.
              </p>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={activeTab === item.id ? "bg-primary/10 text-primary" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
