import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User, X, CalendarDays, Repeat, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Teacher, Session } from "@/types/center";

interface DailyTimetableProps {
    sessions: Session[];
    teachers?: Teacher[];
}

const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const dayNameToIndex: Record<string, number> = {
    "السبت": 0, "الأحد": 1, "الإثنين": 2, "الاثنين": 2,
    "الثلاثاء": 3, "الأربعاء": 4, "الخميس": 5, "الجمعة": 6
};

const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

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

const formatTime12Arabic = (hour: number, minute: number = 0): string => {
    const minuteStr = minute > 0 ? `:${minute.toString().padStart(2, '0')}` : '';
    if (hour === 0) return `12${minuteStr}  مساءً`;
    if (hour < 12) return `${hour}${minuteStr} صباحًا`;
    if (hour === 12) return `12${minuteStr} ظهرًا`;
    if (hour < 17) return `${hour - 12}${minuteStr} عصرًا`;
    return `${hour - 12}${minuteStr} مساءً`;
};

const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 6 ? 0 : (day + 1);
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const DailyTimetable = ({ sessions, teachers = [] }: DailyTimetableProps) => {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    // حساب نطاق التواريخ من الحصص
    const { minDate, maxDate, weeksWithSessions } = useMemo(() => {
        if (sessions.length === 0) {
            const now = new Date();
            return {
                minDate: now,
                maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                weeksWithSessions: new Set<number>()
            };
        }

        let earliest: Date | null = null;
        let latest: Date | null = null;
        const weeksSet = new Set<number>();

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
            } else if (session.type === 'single' && session.startDateTime) {
                const sessionDate = new Date(session.startDateTime);
                if (!earliest || sessionDate < earliest) earliest = sessionDate;
                if (!latest || sessionDate > latest) latest = sessionDate;
            }
        });

        const now = new Date();
        const startDate = earliest || now;
        const endDate = latest || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // حساب الأسابيع التي تحتوي على حصص
        const firstWeek = getWeekStart(startDate);
        let currentWeek = new Date(firstWeek);
        while (currentWeek <= endDate) {
            const weekNum = Math.floor((currentWeek.getTime() - firstWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
            weeksSet.add(weekNum);
            currentWeek = new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        return { minDate: startDate, maxDate: endDate, weeksWithSessions: weeksSet };
    }, [sessions]);

    const weeksArray = Array.from(weeksWithSessions).sort((a, b) => a - b);
    const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
    const currentWeekNum = weeksArray[currentWeekIdx] || 0;

    const weekStart = useMemo(() => {
        const start = getWeekStart(minDate);
        const offset = new Date(start);
        offset.setDate(start.getDate() + (currentWeekNum * 7));
        return offset;
    }, [currentWeekNum, minDate]);

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            return date;
        });
    }, [weekStart]);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // تحديد اليوم التلقائي عند تغيير الأسبوع
    useEffect(() => {
        const today = new Date();
        const todayKey = today.toDateString();

        // البحث عن اليوم الحالي في أيام الأسبوع المعروضة
        const todayInWeek = weekDates.find(date => date.toDateString() === todayKey);

        if (todayInWeek) {
            setSelectedDate(todayInWeek);
        } else if (weekDates.length > 0) {
            // إذا لم يكن اليوم الحالي موجوداً، نختار أول يوم في الأسبوع
            setSelectedDate(weekDates[0]);
        }
    }, [weekDates]);

    // استخراج الحصص لكل يوم في الأسبوع
    const sessionsByDate = useMemo(() => {
        const map = new Map<string, Session[]>();

        weekDates.forEach((date, dayIndex) => {
            const dateKey = date.toDateString();
            const daySessions: Session[] = [];

            sessions.forEach(session => {
                let sessionDayIndex: number;
                if (typeof session.day === 'number') {
                    sessionDayIndex = session.day;
                } else if (typeof session.day === 'string') {
                    sessionDayIndex = dayNameToIndex[session.day] ?? -1;
                } else {
                    return;
                }

                if (sessionDayIndex === dayIndex) {
                    if (session.type === 'recurring') {
                        if (session.startDateTime && session.endDateTime) {
                            const start = new Date(session.startDateTime);
                            const end = new Date(session.endDateTime);
                            if (date >= start && date <= end) {
                                daySessions.push(session);
                            }
                        }
                    } else if (session.type === 'single' && session.startDateTime) {
                        const sessionDate = new Date(session.startDateTime);
                        if (sessionDate.toDateString() === dateKey) {
                            daySessions.push(session);
                        }
                    }
                }
            });

            daySessions.sort((a, b) => {
                const getTime = (s: Session) => {
                    const timeStr = s.sessionTime || s.time || '';
                    if (!timeStr.includes(':')) return 0;
                    const [h, m] = timeStr.split(':').map(Number);
                    return h * 60 + m;
                };
                return getTime(a) - getTime(b);
            });

            map.set(dateKey, daySessions);
        });

        return map;
    }, [sessions, weekDates]);

    const selectedDateSessions = selectedDate ? (sessionsByDate.get(selectedDate.toDateString()) || []) : [];

    const getTeacherImage = (session: Session) => {
        const teacherId = session.teacherId;
        const teacherName = session.teacherName;
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

    const getSessionTime = (session: Session) => {
        const timeStr = session.sessionTime || session.time || '';
        if (!timeStr.includes(':')) return 'غير محدد';
        const [h, m] = timeStr.split(':').map(Number);
        return formatTime12Arabic(h, m);
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
            return { start: 'غير محدد', duration: session.duration || 120 };
        }
        const [hourStr, minStr] = timeString.split(':');
        const startHour = parseInt(hourStr);
        const startMin = parseInt(minStr);
        const duration = session.duration || 120;
        return { start: formatTime12Arabic(startHour, startMin), duration };
    };

    const getRelatedSessions = (currentSession: Session) => {
        if (!currentSession.type || currentSession.type === 'single') return [];
        return sessions.filter(s =>
            s.id !== currentSession.id &&
            s.subject === currentSession.subject &&
            s.grade === currentSession.grade &&
            s.teacherName === currentSession.teacherName &&
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

    const formatWeekDisplay = () => {
        const startDate = weekDates[0];
        const endDate = weekDates[6];

        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth() + 1;
        const startYear = startDate.getFullYear();

        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();

        return `${startDay}/${startMonth}/${startYear} - ${endDay}/${endMonth}/${endYear}`;
    };

    const canGoPrevious = currentWeekIdx > 0;
    const canGoNext = currentWeekIdx < weeksArray.length - 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessions.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد حصص مسجلة</h3>
                <p className="text-muted-foreground">لم يتم إضافة أي حصص في جدول المركز بعد</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <div>
                            <h3 className="font-bold text-lg text-foreground"> جدول الحصص اليومي </h3>
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
                            onClick={() => setCurrentWeekIdx(prev => prev - 1)}
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
                            onClick={() => setCurrentWeekIdx(prev => prev + 1)}
                            disabled={!canGoNext}
                        >
                            التالي
                        </Button>
                    </div>
                </div>

                {/* Week Calendar */}
                <div className="grid grid-cols-7 gap-0 border-b border-border">
                    {weekDates.map((date, idx) => {
                        const dateKey = date.toDateString();
                        const daySessions = sessionsByDate.get(dateKey) || [];
                        const isToday = date.toDateString() === today.toDateString();
                        const isSelected = selectedDate?.toDateString() === dateKey;
                        const hasSessions = daySessions.length > 0;

                        return (
                            <button
                                key={dateKey}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "relative p-3 border-l border-border hover:bg-accent/50 transition-all min-h-[100px] flex flex-col items-center justify-center group",
                                    isSelected && "bg-primary/10 ring-2 ring-primary ring-inset",
                                    isToday && !isSelected && "bg-primary/5",
                                    !hasSessions && "opacity-40"
                                )}
                            >
                                {/* Day Name */}
                                <div className={cn(
                                    "text-[10px] md:text-xs font-medium text-muted-foreground mb-1",
                                    isToday && "text-primary font-bold"
                                )}>
                                    {days[idx]}
                                </div>

                                {/* Date Number */}
                                <div className={cn(
                                    "text-lg md:text-xl font-bold mb-1",
                                    isToday && "text-primary",
                                    isSelected && "text-primary"
                                )}>
                                    {date.getDate()}
                                </div>

                                {/* Month (if different) */}
                                {date.getMonth() !== weekStart.getMonth() && (
                                    <div className="text-[8px] md:text-[10px] text-muted-foreground">
                                        {monthNames[date.getMonth()].slice(0, 3)}
                                    </div>
                                )}

                                {/* Session Dots */}
                                {hasSessions && (
                                    <div className="flex gap-1 mt-2 flex-wrap justify-center max-w-full">
                                        {daySessions.slice(0, 3).map((session, i) => {
                                            const colorClass = session.grade ? (gradeColors[session.grade] || "bg-primary") : "bg-primary";
                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        colorClass
                                                    )}
                                                />
                                            );
                                        })}
                                        {daySessions.length > 3 && (
                                            <div className="text-[10px] font-bold text-primary">+{daySessions.length - 3}</div>
                                        )}
                                    </div>
                                )}

                                {/* Today Badge */}
                                {isToday && (
                                    <div className="absolute top-0  right-1 bg-primary text-primary-foreground text-[8px] md:text-[10px] px-1 py-0 rounded-sm font-bold  z-10">
                                        اليوم
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Day Sessions */}
                {selectedDate && (
                    <div className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-bold text-sm md:text-base text-foreground flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                حصص {days[selectedDate.getDay() === 6 ? 0 : (selectedDate.getDay() + 1) % 7]}
                                {" "}{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                                {selectedDateSessions.length} حصة
                            </span>
                        </div>

                        {selectedDateSessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl">
                                <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">لا توجد حصص في هذا اليوم</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDateSessions.map((session) => {
                                    const colorClass = session.grade ? (gradeColors[session.grade] || "bg-primary") : "bg-primary";
                                    const teacherImage = getTeacherImage(session);

                                    return (
                                        <div
                                            key={session.id}
                                            className="group relative bg-card hover:bg-accent/5 transition-all duration-300 border border-border rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
                                            onClick={() => setSelectedSession(session)}
                                        >
                                            {/* Grade Color Strip */}
                                            <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${colorClass}`} />

                                            <div className="p-4 pr-6 flex items-center justify-between gap-4">
                                                {/* Left Side (Time & Arrow) */}
                                                <div className="flex flex-row items-center gap-2 min-w-[85px]">


                                                    {/* Arrow */}
                                                    <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">تفاصيل</span>
                                                </div>

                                                {/* Content (Right) */}
                                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                    <h3 className="font-extrabold text-base md:text-lg text-foreground truncate leading-tight w-full">
                                                        {session.subject}
                                                    </h3>
                                                    {session.teacherName && (
                                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/90">
                                                            <span>أ/ {session.teacherName}</span>
                                                        </div>
                                                    )}
                                                    {/* Time Box */}
                                                    <div className="text-lg font-bold text-right w-full pt-2  text-primary font-mono dir-ltr tracking-tight leading-none">
                                                        الوقت  : {getSessionTime(session)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {!selectedDate && (
                    <div className="p-8 text-center text-muted-foreground bg-muted/10">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>اختر يومًا من التقويم لعرض الحصص</p>
                    </div>
                )}
            </div>

            {/* Session Details Modal */}
            <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
                <DialogContent className="w-[90vw] sm:max-w-[450px] p-0 overflow-hidden gap-0 rounded-xl md:rounded-2xl border-0 shadow-2xl">
                    {selectedSession && (
                        <>
                            <div className={`p-4 ${gradeColors[selectedSession.grade || ''] || 'bg-primary'} text-white relative h-32 flex items-end`}>
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
                                {selectedSession.teacherName && (
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 border-4 border-background -mt-10 shadow-md relative z-20">
                                            <AvatarImage src={getTeacherImage(selectedSession) || ""} className="object-cover" />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                <User className="h-7 w-7" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="-mt-4 pt-4">
                                            <p className="text-sm text-muted-foreground font-medium">المدرس</p>
                                            <p className="text-lg font-bold text-foreground">{selectedSession.teacherName}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-border/50" />

                                {/* Day & Time Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span className="text-xs font-medium">التاريخ</span>
                                        </div>
                                        <p className="font-bold text-lg">
                                            {selectedDate ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}` : getDayName(selectedSession.day)}
                                        </p>
                                    </div>

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

export default DailyTimetable;
