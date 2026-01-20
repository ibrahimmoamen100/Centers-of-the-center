import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getHourLabel12Arabic } from "@/lib/dateUtils";

interface Session {
  id: string;
  subject: string;
  teacher?: string;
  teacherName?: string;
  teacherId?: string;
  time?: string;
  sessionTime?: string;
  duration?: number;
  day?: number | string;
  color?: string;
  type?: 'recurring' | 'single';
  startDateTime?: string; // ISO string - start of recurring period or single session
  endDateTime?: string;   // ISO string - end of recurring period
  grade?: string;
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
  "الاثنين": 2,
  "الثلاثاء": 3,
  "الأربعاء": 4,
  "الخميس": 5,
  "الجمعة": 6
};

// Grade colors - consistent colors per grade
const gradeColors: Record<string, string> = {
  "الصف الأول الابتدائي": "bg-blue-500",
  "الصف الثاني الابتدائي": "bg-cyan-500",
  "الصف الثالث الابتدائي": "bg-teal-500",
  "الصف الرابع الابتدائي": "bg-green-500",
  "الصف الخامس الابتدائي": "bg-lime-500",
  "الصف السادس الابتدائي": "bg-yellow-500",
  "الصف الأول الإعدادي": "bg-orange-500",
  "الصف الثاني الإعدادي": "bg-amber-500",
  "الصف الثالث الإعدادي": "bg-red-500",
  "الصف الأول الثانوي": "bg-pink-500",
  "الصف الثاني الثانوي": "bg-purple-500",
  "الصف الثالث الثانوي": "bg-indigo-500",
};

const TimetableCalendar = ({ sessions, openingTime, closingTime }: TimetableCalendarProps) => {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  // 🎯 Extract unique grades from sessions
  const availableGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    sessions.forEach(session => {
      if (session.grade) gradesSet.add(session.grade);
    });
    return Array.from(gradesSet).sort();
  }, [sessions]);

  // 📅 Calculate time range (min/max week) based on actual sessions
  const { minDate, maxDate } = useMemo(() => {
    if (sessions.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // +1 week
      };
    }

    let earliest: Date | null = null;
    let latest: Date | null = null;

    sessions.forEach(session => {
      if (session.type === 'recurring') {
        // For recurring: use startDateTime and endDateTime
        if (session.startDateTime) {
          const start = new Date(session.startDateTime);
          if (!earliest || start < earliest) earliest = start;
        }
        if (session.endDateTime) {
          const end = new Date(session.endDateTime);
          if (!latest || end > latest) latest = end;
        }
      } else if (session.type === 'single') {
        // For single: use startDateTime only
        if (session.startDateTime) {
          const sessionDate = new Date(session.startDateTime);
          if (!earliest || sessionDate < earliest) earliest = sessionDate;
          if (!latest || sessionDate > latest) latest = sessionDate;
        }
      }
    });

    // Fallback to current week if no dates found
    const now = new Date();
    return {
      minDate: earliest || now,
      maxDate: latest || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  }, [sessions]);

  // Get current week number based on minDate
  const getWeekNumber = (date: Date): number => {
    const weekStart = getWeekStart(minDate);
    const currentWeekStart = getWeekStart(date);
    const diffTime = currentWeekStart.getTime() - weekStart.getTime();
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks;
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = day === 6 ? 0 : (day + 1); // Saturday is start of week (day 6)
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Current week state
  const minWeek = 0;
  const maxWeek = getWeekNumber(maxDate);
  const currentActualWeek = getWeekNumber(new Date());

  // Initialize to current actual week, but constrain within valid range
  const initialWeek = Math.max(minWeek, Math.min(currentActualWeek, maxWeek));
  const [currentWeek, setCurrentWeek] = useState(initialWeek);

  // Calculate week dates
  const weekStart = useMemo(() => {
    const start = getWeekStart(minDate);
    const offset = new Date(start);
    offset.setDate(start.getDate() + (currentWeek * 7));
    return offset;
  }, [currentWeek, minDate]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return end;
  }, [weekStart]);

  // Week navigation handlers
  const canGoPrevious = currentWeek > minWeek;
  const canGoNext = currentWeek < maxWeek;

  const handlePreviousWeek = () => {
    if (canGoPrevious) {
      setCurrentWeek(prev => prev - 1);
    }
  };

  const handleNextWeek = () => {
    if (canGoNext) {
      setCurrentWeek(prev => prev + 1);
    }
  };

  // Filter sessions for current week and selected grade
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Grade filter
      if (selectedGrade !== "all" && session.grade !== selectedGrade) {
        return false;
      }

      // Date/Week filter
      if (session.type === 'recurring') {
        // Recurring session: check if current week is within start/end range
        if (session.startDateTime && session.endDateTime) {
          const sessionStart = new Date(session.startDateTime);
          const sessionEnd = new Date(session.endDateTime);

          // Check if current week overlaps with session period
          return weekStart <= sessionEnd && weekEnd >= sessionStart;
        }
        return true; // Show if no date range specified
      } else if (session.type === 'single') {
        // Single session: check if it falls in current week
        if (session.startDateTime) {
          const sessionDate = new Date(session.startDateTime);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        }
        return false;
      }

      return true; // Show legacy sessions
    });
  }, [sessions, currentWeek, selectedGrade, weekStart, weekEnd]);

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
      if (!isNaN(h)) end = h + 1;
    }

    if (end <= start) end = start + 12;

    const hoursArray = Array.from({ length: end - start }, (_, i) => i + start);
    return { startHour: start, endHour: end, hours: hoursArray };
  }, [openingTime, closingTime]);

  const getSessionStyle = (session: Session) => {
    let timeString: string | undefined;

    if (session.type === 'recurring') {
      timeString = session.sessionTime;
    } else if (session.type === 'single') {
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
      timeString = session.time;
    }

    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
      return { top: '0px', height: '60px' };
    }

    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      return { top: '0px', height: '60px' };
    }

    const sessionStartHour = parseInt(timeParts[0]);
    const startMinute = parseInt(timeParts[1]);

    if (isNaN(sessionStartHour) || isNaN(startMinute)) {
      return { top: '0px', height: '60px' };
    }

    const top = ((sessionStartHour - startHour) * 60 + startMinute) * (64 / 60);
    const height = (session.duration || 60) * (64 / 60);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Format week display
  const formatWeekDisplay = () => {
    const startDay = weekStart.getDate();
    const startMonth = weekStart.getMonth() + 1;
    const endDay = weekEnd.getDate();
    const endMonth = weekEnd.getMonth() + 1;
    const year = weekEnd.getFullYear();

    return `${startDay}/${startMonth} - ${endDay}/${endMonth}/${year}`;
  };

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد حصص مسجلة</h3>
          <p className="text-muted-foreground">لم يتم إضافة أي حصص في جدول المركز بعد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header with Week Navigation & Grade Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg text-foreground">جدول الحصص الأسبوعي</h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Grade Filter */}
          {availableGrades.length > 0 && (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="كل الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الصفوف</SelectItem>
                  {availableGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Week Navigation */}
          <div className="flex items-center gap-2 bg-background rounded-lg p-1 border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviousWeek}
              disabled={!canGoPrevious}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="px-3 text-sm font-medium text-foreground whitespace-nowrap min-w-[140px] text-center">
              {formatWeekDisplay()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextWeek}
              disabled={!canGoNext}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-border bg-muted/20">
            <div className="p-3 text-center text-sm text-muted-foreground">
              الوقت
            </div>
            {days.map((day, index) => (
              <div
                key={day}
                className="p-3 text-center font-medium text-foreground border-r border-border"
              >
                <div className="hidden md:block">{day}</div>
                <div className="block md:hidden text-xs">{day.substring(0, 3)}</div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {/* Hour Lines */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 h-16 border-b border-border/50">
                <div className="p-2 text-xs text-muted-foreground text-center bg-muted/10 flex items-center justify-center">
                  {getHourLabel12Arabic(hour)}
                </div>
                {days.map((day) => (
                  <div
                    key={`${day}-${hour}`}
                    className="relative border-r border-border/50"
                  />
                ))}
              </div>
            ))}

            {/* Sessions */}
            {filteredSessions.map((session) => {
              const style = getSessionStyle(session);

              // Get color based on grade
              const colorClass = session.grade
                ? (gradeColors[session.grade] || "bg-primary")
                : "bg-muted-foreground";

              // Convert day to index
              let dayIndex: number;
              if (typeof session.day === 'number') {
                dayIndex = session.day;
              } else if (typeof session.day === 'string') {
                dayIndex = dayNameToIndex[session.day] ?? 0;
              } else {
                return null;
              }

              const teacherName = session.teacherName || session.teacher || '';
              let timeDisplay = session.sessionTime || session.time || '';

              if (session.type === 'single' && session.startDateTime) {
                try {
                  const date = new Date(session.startDateTime);
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  timeDisplay = `${hours}:${minutes}`;
                } catch (e) {
                  // Keep existing
                }
              }

              // Show duration info for recurring sessions
              const showDuration = session.type === 'recurring' && session.endDateTime;
              const durationText = showDuration
                ? `حتى ${new Date(session.endDateTime!).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : '';

              return (
                <div
                  key={session.id}
                  className={`absolute right-0 mx-1 rounded-lg ${colorClass} text-white p-2 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group`}
                  style={{
                    ...style,
                    right: `calc(${(dayIndex + 1) * 12.5}% + 4px)`,
                    width: "calc(12.5% - 8px)",
                  }}
                >
                  <div className="text-xs font-bold truncate">{session.subject}</div>
                  {teacherName && <div className="text-xs opacity-90 truncate">{teacherName}</div>}
                  {session.grade && <div className="text-xs opacity-75 truncate">{session.grade}</div>}
                  {timeDisplay && <div className="text-xs opacity-75">{timeDisplay}</div>}
                  {showDuration && (
                    <div className="text-[10px] opacity-50 mt-1 italic truncate">
                      {durationText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend - Grade Colors */}
      {availableGrades.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex flex-wrap gap-3">
            <span className="text-xs font-medium text-muted-foreground mr-2">الألوان:</span>
            {availableGrades.map((grade) => (
              <div key={grade} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${gradeColors[grade] || 'bg-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">{grade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No sessions for current week + grade filter */}
      {filteredSessions.length === 0 && sessions.length > 0 && (
        <div className="p-8 text-center border-t border-border">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">
            {selectedGrade === "all"
              ? "لا توجد حصص في هذا الأسبوع"
              : `لا توجد حصص لـ ${selectedGrade} في هذا الأسبوع`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TimetableCalendar;
