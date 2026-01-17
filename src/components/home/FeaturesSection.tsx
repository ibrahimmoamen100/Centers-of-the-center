import { Calendar, MapPin, Users, Search, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "بحث متقدم",
    description: "ابحث حسب المنطقة، المادة، المرحلة، أو اسم المدرس",
  },
  {
    icon: Calendar,
    title: "جداول تفاعلية",
    description: "عرض جداول الحصص بشكل مرئي سهل الفهم",
  },
  {
    icon: Users,
    title: "معلومات المدرسين",
    description: "تعرف على المدرسين وتخصصاتهم وخبراتهم",
  },
  {
    icon: MapPin,
    title: "تحديد الموقع",
    description: "اعثر على المراكز القريبة منك بسهولة",
  },
  {
    icon: Clock,
    title: "حجز فوري",
    description: "احجز مكانك في الحصة مباشرة من المنصة",
  },
  {
    icon: Shield,
    title: "مراكز معتمدة",
    description: "جميع المراكز موثقة ومعتمدة من المنصة",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            لماذا دليل المراكز؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نوفر لك كل ما تحتاجه لاختيار المركز التعليمي المناسب
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up stagger-${(index % 3) + 1}`}
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
