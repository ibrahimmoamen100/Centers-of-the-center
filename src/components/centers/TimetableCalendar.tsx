import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHourLabel12Arabic } from "@/lib/dateUtils";

interface Session {
  id: string;
  subject: string;
  teacher?: string; // Made optional for compatibility
  teacherName?: string; // Added for new structure
  teacherId?: string; // Added for new structure
  time?: string; // Legacy field - optional
  sessionTime?: string; // New field for recurring sessions
  duration?: number; // in minutes - optional
  day?: number | string; // 0-6 (Sat-Fri) or day name in Arabic
  color?: string; // Optional
  type?: 'recurring' | 'single'; // Session type
  startDateTime?: string; // ISO string
  endDateTime?: string; // ISO string
  grade?: string; // Added for new structure
}

interface TimetableCalendarProps {
  sessions: Session[];
  openingTime?: string;
  closingTime?: string;
}

const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const dayNameToIndex: Record<string, number> = {
  "السبت": 0,
  "الأحد": 1,
  "الإثنين": 2,
  "الاثنين": 2, // Alternative spelling
  "الثلاثاء": 3,
  "الأربعاء": 4,
  "الخميس": 5,
  "الجمعة": 6
};

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

const TimetableCalendar = ({ sessions, openingTime, closingTime }: TimetableCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Determine start/end hours
  const { startHour, endHour, hours } = useMemo(() => {
    let start = 8;
    let end = 20;

    if (openingTime) {
      const [h] = openingTime.split(':').map(Number);
      if (!isNaN(h)) start = h;
    }

    if (closingTime) {
      const [h] = closingTime.split(':').map(Number);
      if (!isNaN(h)) end = h + 1; // Add 1 to show the closing hour slot
    }

    // Ensure valid range
    if (end <= start) end = start + 12;

    const hoursArray = Array.from({ length: end - start }, (_, i) => i + start);
    return { startHour: start, endHour: end, hours: hoursArray };
  }, [openingTime, closingTime]);

  const getSessionStyle = (session: Session) => {
    // Determine the time string to use
    let timeString: string | undefined;

    if (session.type === 'recurring') {
      // Recurring session uses sessionTime
      timeString = session.sessionTime;
    } else if (session.type === 'single') {
      // Single session uses startDateTime - extract time from ISO string
      if (session.startDateTime) {
        try {
          const date = new Date(session.startDateTime);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          timeString = `${hours}:${minutes}`;
        } catch (e) {
          console.warn('Invalid startDateTime:', session.startDateTime);
        }
      }
    } else {
      // Legacy format
      timeString = session.time;
    }

    // Validate that time exists and is in correct format
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
      console.warn('Invalid session time format:', session);
      return {
        top: '0px',
        height: '60px',
      };
    }

    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      console.warn('Invalid time format:', timeString);
      return {
        top: '0px',
        height: '60px',
      };
    }

    const sessionStartHour = parseInt(timeParts[0]);
    const startMinute = parseInt(timeParts[1]);

    // Validate parsed numbers
    if (isNaN(sessionStartHour) || isNaN(startMinute)) {
      console.warn('Invalid hour/minute values:', timeString);
      return {
        top: '0px',
        height: '60px',
      };
    }

    const top = ((sessionStartHour - startHour) * 60 + startMinute) * (64 / 60); // 64px per hour
    const height = (session.duration || 60) * (64 / 60); // Default to 60 minutes if duration is missing

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
          {/* Week navigation removed for simplicity/focus on weekly view */}
          <span className="text-sm font-medium text-muted-foreground px-2">
            الأسبوع الحالي
          </span>
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
                <div className="p-2 text-xs text-muted-foreground text-center bg-muted/20 flex items-center justify-center">
                  {getHourLabel12Arabic(hour)}
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

              // Convert day to index (handle both number and string)
              let dayIndex: number;
              if (typeof session.day === 'number') {
                dayIndex = session.day;
              } else if (typeof session.day === 'string') {
                dayIndex = dayNameToIndex[session.day] ?? 0;
              } else {
                console.warn('Invalid day value:', session);
                return null; // Skip invalid sessions
              }

              // Get teacher name (support both old and new structure)
              const teacherName = session.teacherName || session.teacher || '';

              // Get time display (prefer calculated from style, fallback to raw data)
              let timeDisplay = session.sessionTime || session.time || '';
              if (session.type === 'single' && session.startDateTime) {
                try {
                  const date = new Date(session.startDateTime);
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  timeDisplay = `${hours}:${minutes}`;
                } catch (e) {
                  // Keep existing timeDisplay
                }
              }

              return (
                <div
                  key={session.id}
                  className={`absolute right-0 mx-1 rounded-lg ${colorClass} text-white p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow overflow-hidden`}
                  style={{
                    ...style,
                    right: `calc(${(dayIndex + 1) * 12.5}% + 4px)`,
                    width: "calc(12.5% - 8px)",
                  }}
                >
                  <div className="text-xs font-bold truncate">{session.subject}</div>
                  {teacherName && <div className="text-xs opacity-90 truncate">{teacherName}</div>}
                  {timeDisplay && <div className="text-xs opacity-75">{timeDisplay}</div>}
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
