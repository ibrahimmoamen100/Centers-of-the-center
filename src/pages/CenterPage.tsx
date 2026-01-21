import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Phone, MessageCircle, Clock, Star, Users, GraduationCap, Calendar, ChevronLeft, Search, Filter, Loader2, AlertCircle, CalendarDays, Facebook, Instagram, Share2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TimetableCalendar from "@/components/centers/TimetableCalendar";
import DailyTimetable from "@/components/centers/DailyTimetable";
import TeacherCard from "@/components/centers/TeacherCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatWorkingHoursDisplay } from "@/lib/centerUtils";
import { useCenterDetails } from "@/hooks/useCenterDetails";
import ErrorBoundary from "@/components/ErrorBoundary";

const CenterPage = () => {
  const { id: identifier } = useParams();

  // استخدام الـ Hook المحسّن
  const { center: centerData, teachers, sessions, loading, error } = useCenterDetails(identifier);

  // حالة اختيار الصف الدراسي
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [gradeSelectionRequired, setGradeSelectionRequired] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');

  // localStorage key للصف المختار (مرتبط بـ ID المركز)
  const STORAGE_KEY = `center_${identifier}_selected_grade`;

  // تحميل الصف المحفوظ من localStorage عند التحميل الأولي
  useEffect(() => {
    if (centerData && centerData.grades && centerData.grades.length > 0) {
      const savedGrade = localStorage.getItem(STORAGE_KEY);

      // التحقق من أن الصف المحفوظ لا يزال موجوداً في قائمة الصفوف
      if (savedGrade && centerData.grades.includes(savedGrade)) {
        setSelectedGrade(savedGrade);
        setGradeSelectionRequired(false);
      } else {
        setGradeSelectionRequired(true);
      }
    } else if (centerData && (!centerData.grades || centerData.grades.length === 0)) {
      // إذا لم يكن هناك صفوف مسجلة، لا نطلب الاختيار
      setGradeSelectionRequired(false);
    }
  }, [centerData, STORAGE_KEY]);

  // استخراج الصفوف التي تحتوي على حصص فقط
  const activeGrades = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    // استخراج جميع الصفوف من الحصص
    const gradesWithSessions = new Set<string>();
    sessions.forEach(s => {
      if (s.grade) gradesWithSessions.add(s.grade);
    });

    // استخدام ترتيب الصفوف من بيانات المركز إذا وجد، وإلا ترتيب أبجدي
    if (centerData?.grades && centerData.grades.length > 0) {
      return centerData.grades.filter(g => gradesWithSessions.has(g));
    }

    return Array.from(gradesWithSessions).sort();
  }, [sessions, centerData]);

  // دالة تغيير الصف الدراسي
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setGradeSelectionRequired(false);
    // حفظ الصف في localStorage
    localStorage.setItem(STORAGE_KEY, grade);
  };

  // تصفية الحصص حسب الصف المختار
  const filteredSessions = useMemo(() => {
    if (!selectedGrade) return [];
    return sessions.filter(session => session.grade === selectedGrade);
  }, [sessions, selectedGrade]);

  // استخراج المدرسين من الحصص المصفاة (مصدر الحقيقة الوحيد)
  const filteredTeachers = useMemo(() => {
    if (!selectedGrade || filteredSessions.length === 0) return [];

    // استخراج teacherIds الفريدة من الحصص المصفاة
    const teacherIdsSet = new Set<string>();
    filteredSessions.forEach(session => {
      if (session.teacherId) {
        teacherIdsSet.add(session.teacherId);
      }
    });

    // جلب بيانات المدرسين بناءً على teacherIds
    const teachersMap = new Map(teachers.map(t => [t.id, t]));
    const uniqueTeachers: typeof teachers = [];

    teacherIdsSet.forEach(teacherId => {
      const teacher = teachersMap.get(teacherId);
      if (teacher) {
        uniqueTeachers.push(teacher);
      } else {
        // في حالة عدم وجود بيانات كاملة للمدرس، نحاول استخراجها من الحصة
        const session = filteredSessions.find(s => s.teacherId === teacherId);
        if (session && session.teacherName) {
          console.warn(`Teacher data incomplete for ID: ${teacherId}. Using session data as fallback.`);
          uniqueTeachers.push({
            id: teacherId,
            name: session.teacherName,
            subject: session.subject,
            grade: selectedGrade,
            image: session.teacherImage,
            photo: session.teacherImage,
          });
        }
      }
    });

    return uniqueTeachers;
  }, [filteredSessions, teachers, selectedGrade]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات المركز...</p>
        </div>
      </div>
    );
  }

  if (error || !centerData) {
    return (
      <div className="min-h-screen flex flex-col pt-10 items-center justify-center bg-background">
        <Header isSticky={false} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">عذراً</h2>
          <p className="text-muted-foreground mb-6">{error || "لم يتم العثور على المركز المطلوب"}</p>
          <Button onClick={() => window.history.back()}>العودة للصفحة السابقة</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const workingHoursDisplay = formatWorkingHoursDisplay(
    centerData?.openingTime,
    centerData?.closingTime,
    centerData?.workingHours || 'غير محدد'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header isSticky={false} />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-hero py-12 lg:py-16">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="h-28 w-28 rounded-2xl overflow-hidden bg-card shadow-xl flex-shrink-0 flex items-center justify-center">
                {centerData.logo ? (
                  <img
                    src={centerData.logo}
                    alt={centerData.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <MapPin className="h-10 w-10 text-muted-foreground opacity-50" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                    {centerData.name}
                  </h1>
                </div>

                <div className="flex flex-col gap-2 text-primary-foreground/90 mb-5">
                  {/* Location: Governorate & Area */}
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{centerData.governorate}</span>
                    <span className="opacity-50">|</span>
                    <span>{centerData.area}</span>
                  </div>

                  {/* Detailed Address */}
                  {centerData.address && (
                    <div className="text-sm text-primary-foreground/80 pr-6 leading-relaxed max-w-xl">
                      {centerData.address}
                    </div>
                  )}

                  {/* Working Hours Box */}
                  <div className="mt-2 sm:w-fit">
                    <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-sm hover:bg-black/30 transition-colors">
                      <Clock className="h-3.5 w-3.5 text-primary-foreground/90" />
                      <span className="text-sm font-medium text-primary-foreground dir-rtl">
                        {workingHoursDisplay}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {centerData.stages.map((stage) => (
                    <Badge key={stage} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                      {stage}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => window.location.href = `tel:${centerData.phone}`}
                >
                  <Phone className="h-4 w-4 ml-2" />
                  اتصل الآن
                </Button>
                <Button
                  variant="hero-outline"
                  size="lg"
                  onClick={() => {
                    const shareText = `شاهد هذا المركز التعليمي المميز: ${centerData.name}\n${window.location.href}`;
                    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* Grade Selection Section (Restored Sticky Bar) */}
        {centerData.grades && centerData.grades.length > 0 && (
          <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
            <div className="container py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <label className="font-semibold text-foreground">اختر الصف الدراسي:</label>
                </div>
                <Select value={selectedGrade || ""} onValueChange={handleGradeChange}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="اختر الصف الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeGrades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGrade && (
                  <Badge variant="secondary" className="text-sm hidden sm:inline-flex">
                    {filteredSessions.length} حصة • {filteredTeachers.length} مدرس
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}



        {/* Content */}
        <div className="container py-8">
          {gradeSelectionRequired ? (
            // عرض رسالة اختيار الصف
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center shadow-lg">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold text-foreground mb-3">مرحباً بك!</h2>
                <p className="text-muted-foreground mb-6">
                  لعرض جدول الحصص والمدرسين، يرجى اختيار الصف الدراسي
                </p>

                <div className="mb-6">
                  <Select value={selectedGrade || ""} onValueChange={handleGradeChange}>
                    <SelectTrigger className="w-full h-12 text-lg">
                      <SelectValue placeholder="اختر الصف الدراسي..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeGrades.map((grade) => (
                        <SelectItem key={grade} value={grade} className="text-base py-3">
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium mb-1 flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    ملحوظة
                  </p>
                  <p>سيتم حفظ اختيارك للزيارات القادمة تلقائياً</p>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="timetable" className="space-y-8">
              <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
                <TabsTrigger value="timetable" className="data-[state=active]:bg-card px-6 py-3">
                  جدول الحصص
                </TabsTrigger>
                <TabsTrigger value="teachers" className="data-[state=active]:bg-card px-6 py-3">
                  المدرسين
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-card px-6 py-3">
                  عن المركز
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-card px-6 py-3">
                  التواصل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timetable" className="mt-8 space-y-6">

                {selectedGrade ? (
                  filteredSessions.length > 0 ? (
                    <div className="space-y-4">
                      {/* View Mode Toggle */}
                      <div className="flex justify-center gap-2 bg-muted/30 p-1 rounded-lg w-fit mx-auto border">
                        <Button
                          variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('weekly')}
                          className="gap-2"
                        >
                          <CalendarDays className="h-4 w-4" />
                          <span className="inline">أسبوعي</span>
                        </Button>
                        <Button
                          variant={viewMode === 'daily' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('daily')}
                          className="gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="inline">يومي</span>
                        </Button>
                      </div>

                      {/* Timetable View */}
                      <ErrorBoundary
                        fallback={
                          <div className="text-center py-12 text-destructive border rounded-xl bg-destructive/10">
                            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                            <p>حدث خطأ في عرض جدول الحصص. قد تكون بعض البيانات غير صحيحة.</p>
                          </div>
                        }
                      >
                        {viewMode === 'weekly' ? (
                          <TimetableCalendar
                            sessions={filteredSessions}
                            teachers={filteredTeachers}
                            openingTime={centerData?.openingTime}
                            closingTime={centerData?.closingTime}
                          />
                        ) : (
                          <DailyTimetable
                            sessions={filteredSessions}
                            teachers={filteredTeachers}
                          />
                        )}
                      </ErrorBoundary>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>لا يوجد حصص متاحة للصف الدراسي: {selectedGrade}</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>يرجى اختيار الصف الدراسي أولاً</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="teachers" className="mt-8 space-y-6">
                {/* Recommended Teachers Note */}
                <div className="mb-6 bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-4 mx-4 sm:mx-0">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">مدرسين   {selectedGrade}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      نخبة من أفضل المدرسين المتخصصين في تدريس  {selectedGrade}، تم اختيارهم بعناية لضمان تفوقك الدراسي.
                    </p>
                  </div>
                </div>

                {selectedGrade ? (
                  filteredTeachers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredTeachers.map((teacher) => (
                        <TeacherCard key={teacher.id} teacher={teacher} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>لا يوجد مدرسين للصف الدراسي: {selectedGrade}</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>يرجى اختيار الصف الدراسي أولاً</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4">عن المركز</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {centerData.description}
                      </p>
                    </div>



                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4">الصفوف الدراسية</h3>
                      <div className="flex flex-wrap gap-2">
                        {centerData.grades.length > 0 ? (
                          centerData.grades.map((grade) => (
                            <Badge
                              key={grade}
                              variant={grade === selectedGrade ? "default" : "outline"}
                              className="text-sm px-4 py-2"
                            >
                              {grade}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">لم يتم تحديد صفوف دراسية</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <h3 className="text-lg font-bold text-foreground mb-4">إحصائيات سريعة</h3>
                      <div className="space-y-4">

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">عدد المدرسين</span>
                          <span className="font-bold">{teachers.length}</span>
                        </div>
                        {selectedGrade && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">مدرسي {selectedGrade}</span>
                            <span className="font-bold text-primary">{filteredTeachers.length}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">المواد</span>
                          <span className="font-bold">{centerData.subjects.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                    <h3 className="text-xl font-bold text-foreground">معلومات التواصل</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="space-y-2 w-full">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-foreground text-sm">المحافظة</p>
                              <p className="text-muted-foreground">{centerData.governorate}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">المنطقة</p>
                              <p className="text-muted-foreground">{centerData.area}</p>
                            </div>
                          </div>
                          {centerData.address && (
                            <div>
                              <p className="font-medium text-foreground text-sm">العنوان التفصيلي</p>
                              <p className="text-muted-foreground">{centerData.address}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">رقم الهاتف</p>
                          <p className="text-muted-foreground">{centerData.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">ساعات العمل</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-sm font-normal py-1 px-3 bg-muted/50">
                              {workingHoursDisplay}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="font-medium text-foreground mb-3">تابعنا على</p>
                      <div className="flex items-center gap-3">
                        {!centerData.social?.facebook && !centerData.social?.instagram && !centerData.social?.whatsapp && (
                          <p className="text-sm text-muted-foreground">لا توجد حسابات تواصل اجتماعي</p>
                        )}

                        {centerData.social?.facebook && (
                          <a
                            href={centerData.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        )}

                        {centerData.social?.instagram && (
                          <a
                            href={centerData.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}

                        {centerData.social?.whatsapp && (
                          <a
                            href={`https://wa.me/${centerData.social.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-xl font-bold text-foreground mb-6">احجز الآن</h3>
                    <div className="space-y-4">
                      <Button
                        variant="hero"
                        size="xl"
                        className="w-full"
                        onClick={() => window.location.href = `tel:${centerData.phone}`}
                      >
                        <Phone className="h-5 w-5 ml-2" />
                        اتصل للحجز
                      </Button>
                      <Button
                        variant="hero-outline"
                        size="xl"
                        className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20"
                        onClick={() => {
                          const whatsappNumber = centerData.social?.whatsapp || centerData.phone;
                          // Ensure number has country code if possible, or assume Egypt +20
                          const cleanNumber = whatsappNumber.replace(/\D/g, '');
                          // If it starts with 01, replace 0 with 20. If 10/11/12/15 directly, prefix 20.
                          const formattedNumber = cleanNumber.startsWith('20') ? cleanNumber : `20${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;

                          const message = selectedGrade
                            ? `مرحباً، أنا مهتم بالحجز في المركز للصف ${selectedGrade}`
                            : `مرحباً، أنا مهتم بالحجز في المركز`;
                          const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <MessageCircle className="h-5 w-5 ml-2" />
                        تواصل واتساب
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CenterPage;
