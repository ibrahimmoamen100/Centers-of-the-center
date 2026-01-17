import { Link } from "react-router-dom";
import CenterCard from "@/components/centers/CenterCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Mock data for featured centers
const featuredCenters = [
  {
    id: "1",
    name: "مركز النور التعليمي",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    location: "المعادي، القاهرة",
    stage: "ثانوي",
    subjects: ["رياضيات", "فيزياء", "كيمياء"],
    rating: 4.8,
    reviewCount: 124,
    teacherCount: 15,
  },
  {
    id: "2",
    name: "أكاديمية التفوق",
    logo: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=100&h=100&fit=crop",
    location: "مدينة نصر، القاهرة",
    stage: "إعدادي - ثانوي",
    subjects: ["لغة عربية", "لغة إنجليزية", "علوم"],
    rating: 4.6,
    reviewCount: 89,
    teacherCount: 12,
  },
  {
    id: "3",
    name: "مركز العلم والمعرفة",
    logo: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=100&h=100&fit=crop",
    location: "الهرم، الجيزة",
    stage: "ابتدائي - إعدادي",
    subjects: ["رياضيات", "لغة عربية", "دراسات"],
    rating: 4.9,
    reviewCount: 156,
    teacherCount: 18,
  },
];

const FeaturedCentersSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              مراكز مميزة
            </h2>
            <p className="text-muted-foreground text-lg">
              أفضل المراكز التعليمية المعتمدة في منطقتك
            </p>
          </div>
          <Button variant="outline" asChild className="group">
            <Link to="/centers">
              عرض الكل
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCenters.map((center, index) => (
            <div key={center.id} className={`animate-slide-up stagger-${index + 1}`}>
              <CenterCard center={center} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCentersSection;
