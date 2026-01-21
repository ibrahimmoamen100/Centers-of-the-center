import { Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    photo?: string;
    image?: string;
    subject?: string;
    subjects?: string[];
    grade?: string; // الصف الدراسي
    experience?: string;
    rating?: number;
    bio?: string;
  };
}

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  // Validate and provide defaults for optional fields
  const photoUrl = teacher.photo || teacher.image || null;
  const subject = teacher.subject || null;
  const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
  const grade = teacher.grade || null;
  const experience = teacher.experience || null;
  const rating = teacher.rating ?? 0;
  const bio = teacher.bio || null;

  return (
    <div className="group relative bg-card rounded-2xl border border-border/60 hover:border-primary/50 p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">

      {/* Decorative gradient background (subtle) */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Avatar Section */}
      <div className="relative mb-4">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-4 ring-background shadow-md group-hover:ring-primary/20 transition-all">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={teacher.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.className = 'flex items-center justify-center w-full h-full bg-muted';
                  icon.innerHTML = '<svg class="h-10 w-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                  parent.appendChild(icon);
                }
              }}
            />
          ) : (
            <User className="h-10 w-10 text-muted-foreground/50" />
          )}
        </div>
        {/* Rating Badge (Absolute) */}
        {rating > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-card border shadow-sm rounded-full px-2 py-0.5 flex items-center gap-1 text-[10px] font-bold">
            <Star className="h-3 w-3 text-warning fill-warning" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="w-full space-y-2">
        <h4 className="font-bold text-lg text-foreground truncate px-2">{teacher.name}</h4>

        {/* Subject */}
        {subject ? (
          <Badge variant="secondary" className="px-3 py-1 font-medium bg-primary/10 text-primary border-0">
            {subject}
          </Badge>
        ) : (
          subjects.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {subjects.slice(0, 2).map((s, i) => (
                <Badge key={i} variant="secondary" className="px-2 py-0.5 bg-muted text-muted-foreground font-normal border-0 text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          )
        )}

        {/* Experience / Bio Snippet */}
        <div className="mt-3 min-h-[40px] flex items-center justify-center">
          {experience ? (
            <p className="text-sm text-muted-foreground font-medium">{experience}</p>
          ) : bio ? (
            <p className="text-xs text-muted-foreground line-clamp-2 px-2 leading-relaxed opacity-80">{bio}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;
