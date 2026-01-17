import { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimetableManagementProps {
  canEdit: boolean;
  remainingOps: number;
}

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const mockSessions = [
  { id: 1, subject: "الرياضيات", teacher: "أ/ محمد", day: "السبت", start: "14:00", end: "16:00", grade: "3ث", color: "bg-blue-500" },
  { id: 2, subject: "الفيزياء", teacher: "أ/ علي", day: "الأحد", start: "16:00", end: "18:00", grade: "3ث", color: "bg-purple-500" },
  { id: 3, subject: "الكيمياء", teacher: "أ/ أحمد", day: "الاثنين", start: "14:00", end: "16:00", grade: "2ث", color: "bg-green-500" },
  { id: 4, subject: "اللغة العربية", teacher: "أ/ حسن", day: "الثلاثاء", start: "10:00", end: "12:00", grade: "3ع", color: "bg-amber-500" },
  { id: 5, subject: "اللغة الإنجليزية", teacher: "أ/ سارة", day: "الأربعاء", start: "16:00", end: "18:00", grade: "1ث", color: "bg-red-500" },
];

export function TimetableManagement({ canEdit, remainingOps }: TimetableManagementProps) {
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [filterGrade, setFilterGrade] = useState("all");

  const getSessionPosition = (start: string, end: string) => {
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);
    const startIndex = hours.indexOf(start);
    const duration = endHour - startHour;
    return { top: startIndex * 60, height: duration * 60 };
  };

  const filteredSessions = filterGrade === "all" 
    ? mockSessions 
    : mockSessions.filter(s => s.grade === filterGrade);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">جدول الحصص</h1>
          <p className="text-muted-foreground">عرض وإدارة جدول الحصص الأسبوعي</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="كل الصفوف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الصفوف</SelectItem>
              <SelectItem value="3ع">الثالث الإعدادي</SelectItem>
              <SelectItem value="1ث">الأول الثانوي</SelectItem>
              <SelectItem value="2ث">الثاني الثانوي</SelectItem>
              <SelectItem value="3ث">الثالث الثانوي</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === "week" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-none"
            >
              أسبوعي
            </Button>
            <Button 
              variant={viewMode === "day" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("day")}
              className="rounded-none"
            >
              يومي
            </Button>
          </div>
        </div>
      </div>

      {!canEdit && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">
              انتهت العمليات المتاحة. جدد اشتراكك للاستمرار في التعديل.
            </p>
          </CardContent>
        </Card>
      )}

      {viewMode === "day" && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              const currentIndex = days.indexOf(selectedDay);
              if (currentIndex > 0) setSelectedDay(days[currentIndex - 1]);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-bold text-lg min-w-24 text-center">{selectedDay}</span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              const currentIndex = days.indexOf(selectedDay);
              if (currentIndex < days.length - 1) setSelectedDay(days[currentIndex + 1]);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-7 border-b bg-muted/50">
              <div className="p-3 text-center font-medium border-l">الوقت</div>
              {(viewMode === "week" ? days : [selectedDay]).map((day) => (
                <div key={day} className="p-3 text-center font-medium border-l last:border-l-0">
                  {day}
                </div>
              ))}
              {viewMode === "day" && <div className="col-span-5" />}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {hours.map((hour, index) => (
                <div key={hour} className="grid grid-cols-7 border-b h-[60px]">
                  <div className="p-2 text-xs text-muted-foreground border-l flex items-start justify-center">
                    {hour}
                  </div>
                  {(viewMode === "week" ? days : [selectedDay]).map((day) => (
                    <div key={`${day}-${hour}`} className="border-l relative" />
                  ))}
                  {viewMode === "day" && <div className="col-span-5" />}
                </div>
              ))}

              {/* Sessions */}
              {filteredSessions
                .filter(session => viewMode === "week" || session.day === selectedDay)
                .map((session) => {
                  const { top, height } = getSessionPosition(session.start, session.end);
                  const dayIndex = viewMode === "week" ? days.indexOf(session.day) + 1 : 1;
                  const colWidth = viewMode === "week" ? 14.28 : 100;
                  const left = viewMode === "week" ? `${dayIndex * colWidth}%` : "14.28%";
                  const width = viewMode === "week" ? `${colWidth - 0.5}%` : "14%";

                  return (
                    <div
                      key={session.id}
                      className={`absolute ${session.color} text-white rounded-md p-2 m-1 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                      style={{
                        top: `${top}px`,
                        height: `${height - 8}px`,
                        right: left,
                        width: width,
                      }}
                    >
                      <p className="font-bold text-sm truncate">{session.subject}</p>
                      <p className="text-xs opacity-90 truncate">{session.teacher}</p>
                      <p className="text-xs opacity-75">{session.start} - {session.end}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
