// High school subjects organized by specialization
export interface SubjectCategory {
  id: string;
  label: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  label: string;
}

export const subjectCategories: SubjectCategory[] = [
  {
    id: "math_science",
    label: "مواد علمي رياضة",
    subjects: [
      { id: "algebra", label: "الجبر" },
      { id: "geometry", label: "الهندسة" },
      { id: "dynamics", label: "الديناميكا" },
      { id: "statics", label: "الاستاتيكا" },
    ],
  },
  {
    id: "bio_science",
    label: "مواد علمي علوم",
    subjects: [
      { id: "biology", label: "الأحياء" },
      { id: "geology", label: "الجيولوجيا" },
    ],
  },
  {
    id: "common",
    label: "مواد مشتركة",
    subjects: [
      { id: "physics", label: "الفيزياء" },
      { id: "chemistry", label: "الكيمياء" },
      { id: "arabic", label: "اللغة العربية" },
      { id: "english", label: "اللغة الإنجليزية" },
      { id: "second_language", label: "اللغة الأجنبية الثانية" },
    ],
  },
  {
    id: "literary",
    label: "مواد أدبي",
    subjects: [
      { id: "history", label: "التاريخ" },
      { id: "geography", label: "الجغرافيا" },
      { id: "philosophy", label: "الفلسفة" },
      { id: "psychology", label: "علم النفس" },
    ],
  },
];

// Flat list of all subjects for easy access
export const allSubjects = subjectCategories.flatMap((cat) => cat.subjects);

// Get subject label by id
export const getSubjectLabel = (id: string): string => {
  const subject = allSubjects.find((s) => s.id === id);
  return subject?.label || id;
};
