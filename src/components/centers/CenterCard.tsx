import { Link } from "react-router-dom";
import { MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Center } from "@/hooks/useCenters";

interface CenterCardProps {
  center: Center;
}

const CenterCard = ({ center }: CenterCardProps) => {
  // Default values for optional fields
  const logo = center.logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop";
  const rating = center.rating || 0;
  const reviewCount = center.reviewCount || 0;

  // Get teacher count - use teacherCount from center data
  const teacherCount = center.teacherCount || 0;

  // Format location: show governorate and area instead of full address
  const locationDisplay = center.governorate && center.area
    ? `${center.governorate} - ${center.area}`
    : center.governorate || center.area || center.location || 'غير محدد';

  // Get all stages (not just first one)
  const stages = center.stages && center.stages.length > 0 ? center.stages : [center.stage].filter(Boolean);

  return (
    <Link
      to={`/center/${center.centerUsername || center.id}`}
      className="block group bg-card rounded-2xl border border-border overflow-hidden card-hover"
    >
      {/* Header with logo and rating */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              <img
                src={logo}
                alt={center.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {center.name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-4 w-4" />
                <span>{locationDisplay}</span>
              </div>
            </div>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="font-semibold text-sm text-warning-foreground">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Stages badges */}
        {stages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {stages.map((stage) => (
              <Badge key={stage} variant="secondary">
                {stage}
              </Badge>
            ))}
          </div>
        )}

        {/* Subjects */}
        <div className="flex flex-wrap gap-2 mb-4">
          {center.subjects.slice(0, 3).map((subject) => (
            <span
              key={subject}
              className="px-3 py-1 rounded-full bg-primary/5 text-primary text-sm border border-primary/10"
            >
              {subject}
            </span>
          ))}
          {center.subjects.length > 3 && (
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
              +{center.subjects.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{teacherCount} مدرس</span>
          </div>
          {reviewCount > 0 && (
            <>
              <span>•</span>
              <span>{reviewCount} تقييم</span>
            </>
          )}
        </div>
        <span className="text-primary font-medium text-sm group-hover:translate-x-[-4px] transition-transform">
          عرض التفاصيل ←
        </span>
      </div>
    </Link>
  );
};

export default CenterCard;
