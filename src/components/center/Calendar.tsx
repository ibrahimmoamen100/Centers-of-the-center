import { useState } from "react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { arEG } from "date-fns/locale";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatArabicTime } from "@/lib/dateUtils";

// Types matching the Session interface in SessionsManagement
interface Session {
    id: string;
    subject: string;
    teacherId: string;
    teacherName: string;
    grade: string;
    type: 'recurring' | 'single';
    day?: string;
    startDateTime: string;
    endDateTime?: string;
    sessionTime?: string;
}

interface CalendarProps {
    sessions: Session[];
}

const DAYS_MAP: Record<string, number> = {
    "الأحد": 0,
    "الاثنين": 1,
    "الثلاثاء": 2,
    "الأربعاء": 3,
    "الخميس": 4,
    "الجمعة": 5,
    "السبت": 6,
};

export function Calendar({ sessions }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week" | "day">("week");

    // Navigation Handlers
    const next = () => {
        if (view === "month") setCurrentDate(addMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (view === "month") setCurrentDate(subMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, -1));
    };

    const today = () => setCurrentDate(new Date());

    // Helper to get sessions for a specific date
    const getSessionsForDate = (date: Date) => {
        const dayName = date.toLocaleDateString("ar-EG", { weekday: "long" });

        return sessions.filter(session => {
            if (session.type === "recurring") {
                return session.day === dayName;
            } else {
                // Check if single session is on this day
                const sessionDate = new Date(session.startDateTime);
                return isSameDay(sessionDate, date);
            }
        });
    };

    // Renderers
    const renderMonth = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 6 }); // Start on Saturday
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 6 });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        // Header (Days of week)
        const weekDays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

        return (
            <div className="w-full">
                <div className="grid grid-cols-7 mb-2 border-b">
                    {weekDays.map((d, i) => (
                        <div key={i} className="text-center font-bold p-2 text-sm text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {eachDayOfInterval({ start: startDate, end: endDate }).map((dayItem, idx) => {
                        const daySessions = getSessionsForDate(dayItem);
                        const isCurrentMonth = isSameMonth(dayItem, monthStart);
                        const isToday = isSameDay(dayItem, new Date());

                        return (
                            <div
                                key={idx}
                                className={`min-h-[100px] border rounded-lg p-2 ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''} ${isToday ? 'border-primary bg-primary/5' : ''}`}
                                onClick={() => { setCurrentDate(dayItem); setView('day'); }}
                            >
                                <div className="font-medium text-right mb-1">{format(dayItem, "d")}</div>
                                <div className="space-y-1">
                                    {daySessions.slice(0, 3).map(session => (
                                        <div key={session.id} className="text-[10px] p-1 rounded bg-secondary truncate">
                                            {session.subject}
                                        </div>
                                    ))}
                                    {daySessions.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground text-center">
                                            +{daySessions.length - 3} المزيد
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeek = () => {
        const startDate = startOfWeek(currentDate, { weekStartsOn: 6 }); // Saturday
        const weekDays = eachDayOfInterval({
            start: startDate,
            end: endOfWeek(currentDate, { weekStartsOn: 6 })
        });

        return (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((dayItem, idx) => {
                    const isToday = isSameDay(dayItem, new Date());
                    const daySessions = getSessionsForDate(dayItem);

                    return (
                        <Card key={idx} className={`border ${isToday ? 'border-primary shadow-md' : ''}`}>
                            <CardHeader className="p-3 bg-muted/50 border-b">
                                <div className="text-center">
                                    <div className="font-bold text-lg">{format(dayItem, "EEEE", { locale: arEG })}</div>
                                    <div className="text-sm text-muted-foreground">{format(dayItem, "d MMM", { locale: arEG })}</div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-2 space-y-2">
                                {daySessions.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-muted-foreground">لا توجد حصص</div>
                                ) : (
                                    daySessions.map(session => (
                                        <div key={session.id} className="p-2 rounded-md border bg-card hover:bg-accent transition-colors text-right">
                                            <div className="font-semibold text-sm truncate">{session.subject}</div>
                                            <div className="text-xs text-muted-foreground truncate">{session.teacherName}</div>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-medium">
                                                <Clock className="w-3 h-3" />
                                                {session.type === 'recurring'
                                                    ? formatArabicTime(session.sessionTime ? `2000-01-01T${session.sessionTime}` : undefined)
                                                    : formatArabicTime(session.startDateTime)
                                                }
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderDay = () => {
        const daySessions = getSessionsForDate(currentDate);

        return (
            <div className="space-y-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{format(currentDate, "EEEE d MMMM yyyy", { locale: arEG })}</h2>
                    <p className="text-muted-foreground">{daySessions.length} حصص مجدولة</p>
                </div>

                {daySessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>لا توجد حصص لهذا اليوم</p>
                        <Button variant="link" onClick={() => setView('week')}>العودة للعرض الأسبوعي</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daySessions.map(session => (
                            <Card key={session.id} className="border-r-4 border-r-primary">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge>{session.subject}</Badge>
                                        <Badge variant="outline">{session.grade}</Badge>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{session.teacherName}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-lg">
                                            {session.type === 'recurring'
                                                ? formatArabicTime(session.sessionTime ? `2000-01-01T${session.sessionTime}` : undefined)
                                                : formatArabicTime(session.startDateTime)
                                            }
                                        </span>
                                    </div>
                                    {session.endDateTime && (
                                        <div className="text-sm text-muted-foreground border-t pt-2">
                                            تاريخ النهاية: {new Date(session.endDateTime).toLocaleDateString('ar-EG')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prev}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={today}>اليوم</Button>
                    <Button variant="outline" size="icon" onClick={next}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-bold mr-4 min-w-[150px] text-center">
                        {format(currentDate, "MMMM yyyy", { locale: arEG })}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={view === 'day' ? 'default' : 'ghost'} onClick={() => setView('day')}>يومي</Button>
                    <Button variant={view === 'week' ? 'default' : 'ghost'} onClick={() => setView('week')}>أسبوعي</Button>
                    <Button variant={view === 'month' ? 'default' : 'ghost'} onClick={() => setView('month')}>شهري</Button>
                </div>
            </div>

            {/* Content */}
            <Card>
                <CardContent className="p-6">
                    {view === 'month' && renderMonth()}
                    {view === 'week' && renderWeek()}
                    {view === 'day' && renderDay()}
                </CardContent>
            </Card>
        </div>
    );
}
