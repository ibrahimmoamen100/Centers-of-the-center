import { Link } from "react-router-dom";
import CenterCard from "@/components/centers/CenterCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCenters } from "@/hooks/useCenters";

const FeaturedCentersSection = () => {
  // Fetch only 3 featured centers
  const { centers, loading } = useCenters({ limitCount: 3 });

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
            <Link to="/search">
              عرض الكل
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-4px] transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-3 text-muted-foreground">جاري تحميل المراكز...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && centers.length === 0 && (
          <div className="bg-muted/50 rounded-lg p-12 text-center">
            <p className="text-muted-foreground text-lg">لا توجد مراكز متاحة حالياً</p>
            <p className="text-muted-foreground mt-2">كن أول من يسجل مركزه</p>
            <Button variant="hero" asChild className="mt-6">
              <Link to="/center/register">سجل مركزك الآن</Link>
            </Button>
          </div>
        )}

        {/* Centers Grid */}
        {!loading && centers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center, index) => (
              <div key={center.id} className={`animate-slide-up stagger-${index + 1}`}>
                <CenterCard center={center} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCentersSection;
