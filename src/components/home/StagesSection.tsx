import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, School } from "lucide-react";

const stages = [
  {
    id: "primary",
    name: "المرحلة الابتدائية",
    grades: "من الصف الأول إلى السادس",
    icon: BookOpen,
    color: "bg-info/10 text-info",
    count: 120,
  },
  {
    id: "prep",
    name: "المرحلة الإعدادية",
    grades: "من الصف الأول إلى الثالث",
    icon: School,
    color: "bg-secondary/10 text-secondary",
    count: 180,
  },
  {
    id: "secondary",
    name: "المرحلة الثانوية",
    grades: "من الصف الأول إلى الثالث",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
    count: 200,
  },
];

const StagesSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            اختر مرحلتك الدراسية
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            تصفح المراكز التعليمية حسب المرحلة الدراسية واعثر على ما يناسب احتياجاتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <Link
                key={stage.id}
                to={`/search?stage=${stage.id}`}
                className={`group relative p-8 rounded-2xl border border-border bg-card card-hover animate-slide-up stagger-${index + 1}`}
              >
                <div className={`inline-flex p-4 rounded-2xl ${stage.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {stage.name}
                </h3>
                <p className="text-muted-foreground mb-4">{stage.grades}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stage.count} مركز
                  </span>
                  <span className="text-primary font-medium text-sm group-hover:translate-x-[-4px] transition-transform">
                    تصفح المراكز ←
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StagesSection;
