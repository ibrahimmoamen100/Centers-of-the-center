import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Calendar, Filter, Clock, User, X, MapPin, Repeat, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Teacher, Session } from "@/types/center";

interface TimetableCalendarProps {
  sessions: Session[];
  teachers?: Teacher[];
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

const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

// Grade colors
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

// Helper function to convert 24h to 12h Arabic format
const formatTime12Arabic = (hour: number, minute: number = 0): string => {
  const minuteStr = minute > 0 ? `:${minute.toString().padStart(2, '0')}` : '';

  if (hour === 0) return `12${minuteStr} منتصف الليل`;
  if (hour < 12) return `${hour}${minuteStr} صباحًا`;
  if (hour === 12) return `12${minuteStr} ظهرًا`;
  if (hour < 17) return `${hour - 12}${minuteStr} عصرًا`;
  return `${hour - 12}${minuteStr} مساءً`;
};

const TimetableCalendar = ({ sessions, teachers = [], openingTime, closingTime }: TimetableCalendarProps) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Helper to get teacher image
  const getTeacherImage = (session: Session) => {
    const teacherId = session.teacherId;
    const teacherName = session.teacherName || session.teacher;

    if (teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher?.photo || teacher?.image) return teacher.photo || teacher.image;
    }

    if (teacherName) {
      const teacher = teachers.find(t => t.name === teacherName);
      if (teacher?.photo || teacher?.image) return teacher.photo || teacher.image;
    }

    return null;
  };

  const availableGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    sessions.forEach(session => {
      if (session.grade) gradesSet.add(session.grade);
    });
    return Array.from(gradesSet).sort();
  }, [sessions]);

  // ... (date calculation logic remains the same)
  // I will skip providing the full date calculation block to save tokens if possible, but replace_file_content needs contiguous block.
  // Let me target the specific parts.

  const { minDate, maxDate } = useMemo(() => {
    if (sessions.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    }

    let earliest: Date | null = null;
    let latest: Date | null = null;

    sessions.forEach(session => {
      if (session.type === 'recurring') {
        if (session.startDateTime) {
          const start = new Date(session.startDateTime);
          if (!earliest || start < earliest) earliest = start;
        }
        if (session.endDateTime) {
          const end = new Date(session.endDateTime);
          if (!latest || end > latest) latest = end;
        }
      } else if (session.type === 'single') {
        if (session.startDateTime) {
          const sessionDate = new Date(session.startDateTime);
          if (!earliest || sessionDate < earliest) earliest = sessionDate;
          if (!latest || sessionDate > latest) latest = sessionDate;
        }
      }
    });

    const now = new Date();
    return {
      minDate: earliest || now,
      maxDate: latest || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  }, [sessions]);

  const getWeekNumber = (date: Date): number => {
    const weekStart = getWeekStart(minDate);
    const currentWeekStart = getWeekStart(date);
    const diffTime = currentWeekStart.getTime() - weekStart.getTime();
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks;
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 6 ? 0 : (day + 1);
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const minWeek = 0;
  const maxWeek = getWeekNumber(maxDate);
  const currentActualWeek = getWeekNumber(new Date());
  const initialWeek = Math.max(minWeek, Math.min(currentActualWeek, maxWeek));
  const [currentWeek, setCurrentWeek] = useState(initialWeek);

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

  const canGoPrevious = currentWeek > minWeek;
  const canGoNext = currentWeek < maxWeek;

  const handlePreviousWeek = () => {
    if (canGoPrevious) setCurrentWeek(prev => prev - 1);
  };

  const handleNextWeek = () => {
    if (canGoNext) setCurrentWeek(prev => prev + 1);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Removed grade filtering logic

      if (session.type === 'recurring') {
        if (session.startDateTime && session.endDateTime) {
          const sessionStart = new Date(session.startDateTime);
          const sessionEnd = new Date(session.endDateTime);
          return weekStart <= sessionEnd && weekEnd >= sessionStart;
        }
        return true;
      } else if (session.type === 'single') {
        if (session.startDateTime) {
          const sessionDate = new Date(session.startDateTime);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        }
        return false;
      }

      return true;
    });
  }, [sessions, currentWeek, weekStart, weekEnd]);

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

  const getSessionStyle = (session: Session, overlapIndex: number = 0, totalOverlaps: number = 1) => {
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
      return { top: '0px', height: '50px' };
    }

    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      return { top: '0px', height: '50px' };
    }

    const sessionStartHour = parseInt(timeParts[0]);
    const startMinute = parseInt(timeParts[1]);

    if (isNaN(sessionStartHour) || isNaN(startMinute)) {
      return { top: '0px', height: '50px' };
    }

    const pixelsPerHour = 60;
    const top = ((sessionStartHour - startHour) * 60 + startMinute) * (pixelsPerHour / 60);
    const height = (session.duration || 90) * (pixelsPerHour / 60);

    return {
      top: `${top}px`,
      height: `${Math.max(height, 55)}px`,
    };
  };

  const groupedSessions = useMemo(() => {
    const grouped: Record<number, Record<string, Session[]>> = {};

    filteredSessions.forEach(session => {
      let dayIndex: number;
      if (typeof session.day === 'number') {
        dayIndex = session.day;
      } else if (typeof session.day === 'string') {
        dayIndex = dayNameToIndex[session.day] ?? 0;
      } else {
        return;
      }

      let timeKey = session.sessionTime || session.time || '';
      if (session.type === 'single' && session.startDateTime) {
        try {
          const date = new Date(session.startDateTime);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          timeKey = `${hours}:${minutes}`;
        } catch (e) { }
      }

      if (!grouped[dayIndex]) grouped[dayIndex] = {};
      if (!grouped[dayIndex][timeKey]) grouped[dayIndex][timeKey] = [];

      grouped[dayIndex][timeKey].push(session);
    });

    return grouped;
  }, [filteredSessions]);

  const formatWeekDisplay = () => {
    const startDay = weekStart.getDate();
    const startMonth = weekStart.getMonth();
    const endDay = weekEnd.getDate();
    const endMonth = weekEnd.getMonth();
    const year = weekEnd.getFullYear();

    // Format: 17/1/2026 - 23/1/2026
    return `${startDay}/${startMonth + 1}/${year} - ${endDay}/${endMonth + 1}/${year}`;
  };

  const getSessionTimeDetails = (session: Session) => {
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
          timeString = session.time;
        }
      }
    } else {
      timeString = session.time;
    }

    if (!timeString || !timeString.includes(':')) {
      return { start: 'غير محدد', end: 'غير محدد', duration: session.duration || 90 };
    }

    const [hourStr, minStr] = timeString.split(':');
    const startHour = parseInt(hourStr);
    const startMin = parseInt(minStr);
    const duration = session.duration || 90;

    return {
      start: formatTime12Arabic(startHour, startMin),
      duration
    };
  };

  const getRelatedSessions = (currentSession: Session) => {
    if (!currentSession.type || currentSession.type === 'single') return [];

    return sessions.filter(s =>
      s.id !== currentSession.id &&
      s.subject === currentSession.subject &&
      s.grade === currentSession.grade &&
      (s.teacherName === currentSession.teacherName || s.teacher === currentSession.teacher) &&
      s.type === 'recurring'
    ).sort((a, b) => {
      const dayA = typeof a.day === 'number' ? a.day : (dayNameToIndex[a.day as string] ?? 0);
      const dayB = typeof b.day === 'number' ? b.day : (dayNameToIndex[b.day as string] ?? 0);
      return dayA - dayB;
    });
  };

  const getDayName = (day: string | number | undefined) => {
    if (typeof day === 'number') return days[day];
    return day || 'غير محدد';
  };

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
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-lg text-foreground">جدول الحصص الأسبوعي</h3>
              <p className="text-xs text-muted-foreground">
                {monthNames[weekStart.getMonth()]} {weekStart.getFullYear()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-background rounded-lg p-1 border shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium"
              onClick={handlePreviousWeek}
              disabled={!canGoPrevious}
            >
              السابق
            </Button>
            <div className="flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[10px] text-muted-foreground font-medium mb-0.5">هذا الأسبوع</span>
              <div className="px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap text-center dir-ltr">
                {formatWeekDisplay()}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium"
              onClick={handleNextWeek}
              disabled={!canGoNext}
            >
              التالي
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-border bg-muted/20">
              <div className="p-3 text-center text-sm text-muted-foreground font-medium">
                الوقت
              </div>
              {days.map((day, index) => {
                // Calculate date for this day column
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + index);

                // Check if it's today
                const today = new Date();
                const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={day}
                    className={cn(
                      "p-3 text-center font-semibold text-foreground border-r border-border text-sm md:text-base relative min-h-[50px] flex items-center justify-center",
                      isToday && "bg-primary/5 ring-2 ring-primary/30 ring-inset"
                    )}
                  >
                    {/* Day Number */}
                    <span className={cn(
                      "absolute top-1 left-2 text-[10px] text-muted-foreground/70 font-mono",
                      isToday && "text-primary font-bold"
                    )}>
                      {date.getDate()}
                    </span>

                    {/* Today Badge */}
                    {isToday && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] px-1 py-0 rounded-sm font-bold ">
                        اليوم
                      </div>
                    )}

                    {day}
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {/* Hour Lines */}
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 h-16 border-b border-border/50">
                  <div className="p-2 text-xs text-muted-foreground text-center bg-muted/10 flex items-center justify-center font-medium">
                    {formatTime12Arabic(hour)}
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
              {Object.entries(groupedSessions).map(([dayIndexStr, timeGroups]) => {
                const dayIndex = parseInt(dayIndexStr);

                return Object.entries(timeGroups).map(([timeKey, sessionsAtTime]) => {
                  const totalOverlaps = sessionsAtTime.length;

                  return sessionsAtTime.map((session, overlapIndex) => {
                    const style = getSessionStyle(session, overlapIndex, totalOverlaps);
                    const colorClass = session.grade
                      ? (gradeColors[session.grade] || "bg-primary")
                      : "bg-muted-foreground";

                    const teacherName = session.teacherName || session.teacher || '';
                    const timeDetails = getSessionTimeDetails(session);
                    const dayName = days[dayIndex];

                    return (
                      <div
                        key={`${session.id}-${overlapIndex}`}
                        className={`absolute rounded-xl ${colorClass} text-white p-2 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group hover:scale-[1.02] active:scale-[0.98] border border-white/10 flex flex-col justify-between`}
                        style={{
                          top: style.top,
                          height: style.height,
                          left: `${(dayIndex + 1) * 12.5 + 0.5}%`,
                          width: totalOverlaps > 1
                            ? `${(12.5 / totalOverlaps) - 1}%`
                            : '11.5%',
                          transform: totalOverlaps > 1
                            ? `translateX(${overlapIndex * 100}%)`
                            : 'none',
                          zIndex: overlapIndex + 10
                        }}
                        onClick={() => setSelectedSession(session)}
                      >
                        {/* Top Section: Arrow & Subject (Swapped) */}
                        <div className="flex justify-between items-start gap-1">
                          {/* More Options Arrow - Moved first (appears Right in LTR, Left in RTL - wait, in RTL flex: start is right. So first item is Right. Second item is Left. Correct?) 
                              In RTL:
                              Flex container. 
                              First child -> Right side
                              Last child -> Left side
                              
                              Current: Text (First) -> Right side. Arrow (Last) -> Left side.
                              User wants: "Transfer speech to other side (Left) and arrow to speech side (Right)".
                              So Arrow must be First Child. Text must be Last Child.
                          */}
                          <div className="opacity-60 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded-full p-0.5 flex-shrink-0">
                            <ChevronLeft className="h-3 w-3" />
                          </div>

                          <div className="min-w-0 text-left">
                            <div className="text-[10px] opacity-80 leading-none mb-1 font-medium text-right">{dayName}</div>
                            <h4 className="text-xs font-bold leading-tight truncate text-right">
                              {session.subject}
                            </h4>
                          </div>
                        </div>

                        {/* Middle/Bottom: Teacher & Time */}
                        <div className="mt-auto pt-2 flex flex-col items-end">
                          {teacherName && (
                            <div className="text-[10px] font-medium truncate mb-1 flex items-center gap-0.5 opacity-95 flex-row-reverse">
                              <span className="opacity-70 text-[9px]">/أ</span>
                              <span>{teacherName}</span>
                            </div>
                          )}

                          <div className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md inline-block font-mono opacity-90 dir-ltr">
                            {timeDetails.start}
                          </div>
                        </div>

                        {/* Overlap indicator - Moved to Right (matches Arrow side) */}
                        {totalOverlaps > 1 && (
                          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-white/50" />
                        )}
                      </div>
                    );
                  });
                });
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        {availableGrades.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-muted-foreground">ألوان الصفوف:</span>
              {availableGrades.map((grade) => (
                <div key={grade} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${gradeColors[grade] || 'bg-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">{grade}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="w-[90vw] sm:max-w-[450px] p-0 overflow-hidden gap-0 rounded-xl md:rounded-2xl border-0 shadow-2xl">
          {selectedSession && (
            <>
              {/* Header with Close Button */}
              <div className={`p-4 ${gradeColors[selectedSession.grade || ''] || 'bg-primary'} text-white relative h-32 flex items-end`}>
                {/* Improved Close Button */}
                <DialogClose className="absolute left-4 top-4 p-2 bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95 rounded-full transition-all text-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm z-50">
                  <X className="h-6 w-6" />
                  <span className="sr-only">إغلاق</span>
                </DialogClose>

                <div className="flex items-center gap-2 absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                  {selectedSession.type === 'recurring' ? (
                    <>
                      <Repeat className="h-3.5 w-3.5" />
                      <span>حصة أسبوعية</span>
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>حصة فردية</span>
                    </>
                  )}
                </div>

                <div className="relative z-10 w-full">
                  <h2 className="text-2xl font-bold leading-tight">{selectedSession.subject}</h2>
                  {selectedSession.grade && (
                    <p className="text-white/90 text-sm mt-0.5">{selectedSession.grade}</p>
                  )}
                </div>

                {/* Decoration */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-background">
                {/* Teacher Info */}
                {(selectedSession.teacherName || selectedSession.teacher) && (
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-background -mt-10 shadow-md relative z-20">
                      <AvatarImage src={getTeacherImage(selectedSession) || ""} className="object-cover" />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-7 w-7" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="-mt-4 pt-4">
                      <p className="text-sm text-muted-foreground font-medium">المدرس</p>
                      <p className="text-lg font-bold text-foreground">
                        {selectedSession.teacherName || selectedSession.teacher}
                      </p>
                    </div>
                  </div>
                )}

                <div className="h-px bg-border/50" />

                {/* Day & Time Info */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Day Name */}
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium">اليوم</span>
                    </div>
                    <p className="font-bold text-lg">
                      {getDayName(selectedSession.day)}
                    </p>
                  </div>

                  {/* Start Time Only */}
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">الموعد</span>
                    </div>
                    <p className="font-bold text-lg text-primary dir-ltr text-right">
                      {getSessionTimeDetails(selectedSession).start}
                    </p>
                  </div>
                </div>

                {/* Recurring Schedule */}
                {selectedSession.type === 'recurring' && (
                  <div className="bg-primary/5 rounded-2xl p-4 space-y-3 border border-primary/10">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                      <Repeat className="h-4 w-4" />
                      المواعيد الأسبوعية
                    </h4>

                    <div className="space-y-2">
                      {/* Current Session */}
                      <div className="flex justify-between items-center text-sm bg-background p-3 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                        <span className="font-bold relative z-10">{getDayName(selectedSession.day)}</span>
                        <span className="font-bold dir-ltr text-primary">{getSessionTimeDetails(selectedSession).start}</span>
                      </div>

                      {/* Related Sessions */}
                      {getRelatedSessions(selectedSession).map(relSession => (
                        <div key={relSession.id} className="flex justify-between items-center text-sm p-2 px-3 text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors">
                          <span>{getDayName(relSession.day)}</span>
                          <span className="dir-ltr">{getSessionTimeDetails(relSession).start}</span>
                        </div>
                      ))}
                    </div>

                    {selectedSession.endDateTime && (
                      <div className="pt-3 mt-2 border-t border-border/50 text-xs text-muted-foreground text-center">
                        مستمرة حتى {new Date(selectedSession.endDateTime).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedSession.notes && (
                  <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900">
                    <p className="font-bold mb-2 flex items-center gap-2 text-amber-700">
                      <MapPin className="h-4 w-4" />
                      ملاحظات
                    </p>
                    <p className="opacity-90 leading-relaxed font-medium">{selectedSession.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimetableCalendar;
