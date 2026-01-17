import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  duration: number; // in minutes
  day: number; // 0-6 (Sat-Fri)
  color: string;
}

interface TimetableCalendarProps {
  sessions: Session[];
}

const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const subjectColors: Record<string, string> = {
  "رياضيات": "bg-calendar-math",
  "لغة عربية": "bg-calendar-arabic",
  "لغة إنجليزية": "bg-calendar-english",
  "علوم": "bg-calendar-science",
  "فيزياء": "bg-calendar-physics",
  "كيمياء": "bg-calendar-chemistry",
  "أحياء": "bg-calendar-biology",
  "تاريخ": "bg-calendar-history",
};

const TimetableCalendar = ({ sessions }: TimetableCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const getSessionStyle = (session: Session) => {
    const startHour = parseInt(session.time.split(":")[0]);
    const startMinute = parseInt(session.time.split(":")[1]);
    const top = ((startHour - 8) * 60 + startMinute) * (64 / 60); // 64px per hour
    const height = session.duration * (64 / 60);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="font-bold text-lg text-foreground">جدول الحصص الأسبوعي</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek - 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground px-2">
            الأسبوع الحالي
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek + 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3 text-center text-sm text-muted-foreground bg-muted/30">
              الوقت
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-medium text-foreground border-r border-border"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {/* Hour Lines */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 h-16 border-b border-border/50">
                <div className="p-2 text-xs text-muted-foreground text-center bg-muted/20">
                  {hour}:00
                </div>
                {days.map((day, dayIndex) => (
                  <div
                    key={`${day}-${hour}`}
                    className="relative border-r border-border/50"
                  />
                ))}
              </div>
            ))}

            {/* Sessions */}
            {sessions.map((session) => {
              const style = getSessionStyle(session);
              const colorClass = subjectColors[session.subject] || "bg-primary";

              return (
                <div
                  key={session.id}
                  className={`absolute right-0 mx-1 rounded-lg ${colorClass} text-white p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow overflow-hidden`}
                  style={{
                    ...style,
                    right: `calc(${(session.day + 1) * 12.5}% + 4px)`,
                    width: "calc(12.5% - 8px)",
                  }}
                >
                  <div className="text-xs font-bold truncate">{session.subject}</div>
                  <div className="text-xs opacity-90 truncate">{session.teacher}</div>
                  <div className="text-xs opacity-75">{session.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex flex-wrap gap-3">
          {Object.entries(subjectColors).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground">{subject}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableCalendar;
