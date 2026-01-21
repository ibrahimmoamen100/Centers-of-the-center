import { useParams } from "react-router-dom";
import { MapPin, Phone, Clock, Star, Users, Facebook, Instagram, MessageCircle, Share2, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TimetableCalendar from "@/components/centers/TimetableCalendar";
import TeacherCard from "@/components/centers/TeacherCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatWorkingHoursDisplay } from "@/lib/centerUtils";
import { useCenterDetails } from "@/hooks/useCenterDetails";
import ErrorBoundary from "@/components/ErrorBoundary";

const CenterPage = () => {
  const { id: identifier } = useParams();

  // استخدام الـ Hook المحسّن
  const { center: centerData, teachers, sessions, loading, error } = useCenterDetails(identifier);

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
        <Header />
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
      <Header />
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
                  <div className="flex items-center gap-1 bg-primary-foreground/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-semibold text-primary-foreground">{centerData.rating.toFixed(1)}</span>
                    <span className="text-primary-foreground/70 text-sm">({centerData.reviewCount})</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-primary-foreground/80 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{centerData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{teachers.length} مدرس</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{workingHoursDisplay}</span>
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
                <Button variant="hero" size="lg">
                  <Phone className="h-4 w-4 ml-2" />
                  اتصل الآن
                </Button>
                <Button variant="hero-outline" size="lg">
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
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

            <TabsContent value="timetable" className="mt-8">
              {sessions.length > 0 ? (
                <ErrorBoundary
                  fallback={
                    <div className="text-center py-12 text-destructive border rounded-xl bg-destructive/10">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                      <p>حدث خطأ في عرض جدول الحصص. قد تكون بعض البيانات غير صحيحة.</p>
                    </div>
                  }
                >
                  <TimetableCalendar
                    sessions={sessions}
                    teachers={teachers}
                    openingTime={centerData?.openingTime}
                    closingTime={centerData?.closingTime}
                  />
                </ErrorBoundary>
              ) : (
                <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>لا يوجد جدول حصص متاح حالياً</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="teachers" className="mt-8">
              {teachers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>لا يوجد مدرسين مسجلين في هذا المركز حتى الآن</p>
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
                    <h3 className="text-xl font-bold text-foreground mb-4">المواد المتاحة</h3>
                    <div className="flex flex-wrap gap-2">
                      {centerData.subjects.length > 0 ? (
                        centerData.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-sm px-4 py-2">
                            {subject}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">لم يتم إضافة مواد بعد</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">الصفوف الدراسية</h3>
                    <div className="flex flex-wrap gap-2">
                      {centerData.grades.length > 0 ? (
                        centerData.grades.map((grade) => (
                          <Badge key={grade} variant="outline" className="text-sm px-4 py-2">
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
                        <span className="text-muted-foreground">التقييم</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-bold">{centerData.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">عدد المدرسين</span>
                        <span className="font-bold">{teachers.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">عدد التقييمات</span>
                        <span className="font-bold">{centerData.reviewCount}</span>
                      </div>
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
                      <div>
                        <p className="font-medium text-foreground">العنوان</p>
                        <p className="text-muted-foreground">{centerData.address}</p>
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
                        <p className="text-muted-foreground">{centerData.workingHours}</p>
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
                    <Button variant="hero" size="xl" className="w-full">
                      <Phone className="h-5 w-5 ml-2" />
                      اتصل للحجز
                    </Button>
                    <Button variant="outline" size="xl" className="w-full">
                      <MessageCircle className="h-5 w-5 ml-2" />
                      تواصل واتساب
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CenterPage;
