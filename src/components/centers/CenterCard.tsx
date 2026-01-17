import { Link } from "react-router-dom";
import { MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CenterCardProps {
  center: {
    id: string;
    name: string;
    logo: string;
    location: string;
    stage: string;
    subjects: string[];
    rating: number;
    reviewCount: number;
    teacherCount: number;
  };
}

const CenterCard = ({ center }: CenterCardProps) => {
  return (
    <Link
      to={`/center/${center.id}`}
      className="block group bg-card rounded-2xl border border-border overflow-hidden card-hover"
    >
      {/* Header with logo and rating */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              <img
                src={center.logo}
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
                <span>{center.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-lg">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="font-semibold text-sm text-warning-foreground">{center.rating}</span>
          </div>
        </div>

        {/* Stage badge */}
        <Badge variant="secondary" className="mb-4">
          {center.stage}
        </Badge>

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
            <span>{center.teacherCount} مدرس</span>
          </div>
          <span>•</span>
          <span>{center.reviewCount} تقييم</span>
        </div>
        <span className="text-primary font-medium text-sm group-hover:translate-x-[-4px] transition-transform">
          عرض التفاصيل ←
        </span>
      </div>
    </Link>
  );
};

export default CenterCard;
