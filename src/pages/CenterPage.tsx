import { useParams } from "react-router-dom";
import { MapPin, Phone, Clock, Star, Users, Facebook, Instagram, MessageCircle, Share2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TimetableCalendar from "@/components/centers/TimetableCalendar";
import TeacherCard from "@/components/centers/TeacherCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const centerData = {
  id: "1",
  name: "مركز النور التعليمي",
  logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
  description: "مركز النور التعليمي هو أحد أبرز المراكز التعليمية في المعادي، يقدم خدمات تعليمية متميزة للمرحلتين الإعدادية والثانوية. نحن نفخر بفريق من المدرسين ذوي الخبرة العالية والمتخصصين في مجالاتهم.",
  location: "المعادي، القاهرة",
  address: "12 شارع الجزيرة، المعادي الجديدة",
  phone: "+20 123 456 7890",
  stages: ["إعدادي", "ثانوي"],
  grades: ["الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"],
  subjects: ["رياضيات", "فيزياء", "كيمياء", "أحياء", "لغة عربية", "لغة إنجليزية"],
  rating: 4.8,
  reviewCount: 124,
  workingHours: "من 3:00 م إلى 10:00 م",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    whatsapp: "+201234567890",
  },
};

const teachers = [
  {
    id: "1",
    name: "أ/ محمد أحمد",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    subjects: ["رياضيات", "هندسة"],
    experience: "15 سنة خبرة",
    rating: 4.9,
  },
  {
    id: "2",
    name: "أ/ سارة محمود",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    subjects: ["فيزياء"],
    experience: "10 سنوات خبرة",
    rating: 4.8,
  },
  {
    id: "3",
    name: "أ/ أحمد علي",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    subjects: ["كيمياء", "أحياء"],
    experience: "12 سنة خبرة",
    rating: 4.7,
  },
  {
    id: "4",
    name: "أ/ فاطمة حسن",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    subjects: ["لغة عربية"],
    experience: "8 سنوات خبرة",
    rating: 4.9,
  },
];

const sessions = [
  { id: "1", subject: "رياضيات", teacher: "أ/ محمد أحمد", time: "15:00", duration: 90, day: 0, color: "math" },
  { id: "2", subject: "فيزياء", teacher: "أ/ سارة محمود", time: "17:00", duration: 90, day: 0, color: "physics" },
  { id: "3", subject: "كيمياء", teacher: "أ/ أحمد علي", time: "15:00", duration: 90, day: 1, color: "chemistry" },
  { id: "4", subject: "لغة عربية", teacher: "أ/ فاطمة حسن", time: "17:30", duration: 60, day: 1, color: "arabic" },
  { id: "5", subject: "رياضيات", teacher: "أ/ محمد أحمد", time: "16:00", duration: 90, day: 2, color: "math" },
  { id: "6", subject: "أحياء", teacher: "أ/ أحمد علي", time: "18:30", duration: 90, day: 3, color: "biology" },
  { id: "7", subject: "لغة إنجليزية", teacher: "أ/ منى السيد", time: "15:00", duration: 60, day: 4, color: "english" },
  { id: "8", subject: "فيزياء", teacher: "أ/ سارة محمود", time: "17:00", duration: 90, day: 5, color: "physics" },
];

const CenterPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-hero py-12 lg:py-16">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="h-28 w-28 rounded-2xl overflow-hidden bg-card shadow-xl flex-shrink-0">
                <img
                  src={centerData.logo}
                  alt={centerData.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                    {centerData.name}
                  </h1>
                  <div className="flex items-center gap-1 bg-primary-foreground/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-semibold text-primary-foreground">{centerData.rating}</span>
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
                    <span>{centerData.workingHours}</span>
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
              <TimetableCalendar sessions={sessions} />
            </TabsContent>

            <TabsContent value="teachers" className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {teachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
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
                      {centerData.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-sm px-4 py-2">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">الصفوف الدراسية</h3>
                    <div className="flex flex-wrap gap-2">
                      {centerData.grades.map((grade) => (
                        <Badge key={grade} variant="outline" className="text-sm px-4 py-2">
                          {grade}
                        </Badge>
                      ))}
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
                          <span className="font-bold">{centerData.rating}</span>
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
                      <a
                        href={centerData.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a
                        href={centerData.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a
                        href={`https://wa.me/${centerData.social.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
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
