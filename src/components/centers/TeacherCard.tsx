import { Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    photo?: string;
    subjects?: string[];
    experience?: string;
    rating?: number;
    bio?: string;
  };
}

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  // Validate and provide defaults for optional fields
  const photoUrl = teacher.photo || null;
  const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
  const experience = teacher.experience || "غير محدد";
  const rating = teacher.rating ?? 0;
  const bio = teacher.bio || null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary/10 flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={teacher.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.className = 'flex items-center justify-center w-full h-full';
                  icon.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                  parent.appendChild(icon);
                }
              }}
            />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate">{teacher.name}</h4>
          <p className="text-sm text-muted-foreground">{experience}</p>
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 text-warning fill-warning" />
              <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>


      {
        bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {bio}
          </p>
        )
      }

      <div className="flex-1 min-h-[0.5rem]"></div> {/* Spacer */}


      {/* Only show subjects if they exist */}
      {
        subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {subjects.map((subject, index) => (
              <Badge key={`${subject}-${index}`} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        )
      }

      {/* Show message if no subjects */}
      {
        subjects.length === 0 && (
          <div className="mt-4 text-xs text-muted-foreground text-center py-2 bg-muted/50 rounded">
            لم يتم تحديد مواد بعد
          </div>
        )
      }
    </div >
  );
};

export default TeacherCard;
