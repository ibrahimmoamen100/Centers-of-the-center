import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    photo: string;
    subjects: string[];
    experience: string;
    rating: number;
  };
}

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary/10">
          <img
            src={teacher.photo}
            alt={teacher.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate">{teacher.name}</h4>
          <p className="text-sm text-muted-foreground">{teacher.experience}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
            <span className="text-sm font-medium text-foreground">{teacher.rating}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {teacher.subjects.map((subject) => (
          <Badge key={subject} variant="secondary" className="text-xs">
            {subject}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TeacherCard;
