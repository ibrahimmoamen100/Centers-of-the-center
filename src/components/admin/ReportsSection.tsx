import { Building2, Users, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
}

const statsData: StatCard[] = [
  {
    title: "إجمالي المراكز",
    value: 45,
    change: 12,
    changeLabel: "مركز جديد هذا الشهر",
    icon: Building2,
    color: "text-primary",
  },
  {
    title: "المراكز النشطة",
    value: 38,
    change: 8.5,
    changeLabel: "نمو عن الشهر السابق",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "الزيارات الشهرية",
    value: "12.5K",
    change: 23,
    changeLabel: "زيادة في الزيارات",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "الإيرادات الشهرية",
    value: "11,400 ج.م",
    change: 15,
    changeLabel: "نمو في الإيرادات",
    icon: CreditCard,
    color: "text-accent",
  },
];

const monthlyData = [
  { month: "يناير", centers: 28, revenue: 8400 },
  { month: "فبراير", centers: 32, revenue: 9600 },
  { month: "مارس", centers: 35, revenue: 10500 },
  { month: "أبريل", centers: 38, revenue: 11400 },
  { month: "مايو", centers: 42, revenue: 12600 },
  { month: "يونيو", centers: 45, revenue: 13500 },
];

const topCenters = [
  { name: "مركز النور التعليمي", views: 1250, students: 150 },
  { name: "مركز الفجر للتعليم", views: 980, students: 200 },
  { name: "أكاديمية التفوق", views: 870, students: 120 },
  { name: "مركز العلم والنور", views: 650, students: 80 },
  { name: "مركز الأمل التعليمي", views: 520, students: 95 },
];

export function ReportsSection() {
  const [period, setPeriod] = useState("month");

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
            <SelectItem value="year">هذا العام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.change > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-xs ${stat.change > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}%
                </span>
                <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                    style={{ height: `${(data.revenue / 15000) * 200}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Centers Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>نمو المراكز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-accent/80 rounded-t-md transition-all hover:bg-accent"
                    style={{ height: `${(data.centers / 50) * 200}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Centers */}
      <Card>
        <CardHeader>
          <CardTitle>أكثر المراكز زيارة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCenters.map((center, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{center.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {center.students} طالب مسجل
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">{center.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">زيارة</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
