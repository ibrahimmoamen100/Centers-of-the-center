import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

const benefits = [
  "عرض جداول الحصص بشكل احترافي",
  "الوصول لآلاف الطلاب وأولياء الأمور",
  "إدارة سهلة لبيانات المركز",
  "دعم فني على مدار الساعة",
];

const CTASection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-background blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-background blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              هل تدير مركزاً تعليمياً؟
              <br />
              <span className="text-secondary">انضم إلينا اليوم!</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              سجل مركزك واحصل على تواجد رقمي قوي يساعدك في الوصول لمزيد من الطلاب وأولياء الأمور.
            </p>
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-primary-foreground">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/center/register">
                  سجل مركزك الآن
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/pricing">تعرف على الأسعار</Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-3xl transform rotate-3" />
              <div className="relative bg-card rounded-3xl shadow-2xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">م</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">مركز النجاح</h3>
                    <p className="text-muted-foreground text-sm">المعادي، القاهرة</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <div className="text-2xl font-bold text-primary">25</div>
                    <div className="text-xs text-muted-foreground">مدرس</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-xs text-muted-foreground">طالب</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <div className="text-2xl font-bold text-primary">4.9</div>
                    <div className="text-xs text-muted-foreground">تقييم</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["رياضيات", "فيزياء", "كيمياء", "أحياء"].map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
