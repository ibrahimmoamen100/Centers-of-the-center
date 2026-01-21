// High school subjects organized by specialization
// ✅ تم تحديث القيم لتطابق Firebase (استخدام Labels كـ IDs)
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
      { id: "الجبر", label: "الجبر" },
      { id: "الهندسة", label: "الهندسة" },
      { id: "الديناميكا", label: "الديناميكا" },
      { id: "الاستاتيكا", label: "الاستاتيكا" },
    ],
  },
  {
    id: "bio_science",
    label: "مواد علمي علوم",
    subjects: [
      { id: "الأحياء", label: "الأحياء" },
      { id: "الجيولوجيا", label: "الجيولوجيا" },
    ],
  },
  {
    id: "common",
    label: "مواد مشتركة",
    subjects: [
      { id: "الفيزياء", label: "الفيزياء" },
      { id: "الكيمياء", label: "الكيمياء" },
      { id: "اللغة العربية", label: "اللغة العربية" },
      { id: "اللغة الإنجليزية", label: "اللغة الإنجليزية" },
      { id: "اللغة الأجنبية الثانية", label: "اللغة الأجنبية الثانية" },
    ],
  },
  {
    id: "languages",
    label: "لغات أجنبية",
    subjects: [
      { id: "اللغة الفرنسية", label: "اللغة الفرنسية" },
      { id: "اللغة الألمانية", label: "اللغة الألمانية" },
      { id: "اللغة الإيطالية", label: "اللغة الإيطالية" },
      { id: "اللغة الإسبانية", label: "اللغة الإسبانية" },
      { id: "اللغة الصينية", label: "اللغة الصينية" },
    ],
  },
  {
    id: "literary",
    label: "مواد أدبي",
    subjects: [
      { id: "التاريخ", label: "التاريخ" },
      { id: "الجغرافيا", label: "الجغرافيا" },
      { id: "الفلسفة", label: "الفلسفة" },
      { id: "علم النفس", label: "علم النفس" },
    ],
  },
  {
    id: "basic",
    label: "مواد أساسية / إعدادي",
    subjects: [
      { id: "العلوم", label: "العلوم" },
      { id: "الدراسات الاجتماعية", label: "الدراسات الاجتماعية" },
      { id: "الرياضيات", label: "الرياضيات" },
      { id: "الحاسب الآلي", label: "الحاسب الآلي" },
      { id: "التربية الدينية", label: "التربية الدينية" },
    ],
  },
  {
    id: "supplementary",
    label: "مواد تكميلية / أخرى",
    subjects: [
      { id: "التربية الوطنية", label: "التربية الوطنية" },
      { id: "الاقتصاد", label: "الاقتصاد" },
      { id: "الإحصاء", label: "الإحصاء" },
      { id: "تكنولوجيا المعلومات", label: "تكنولوجيا المعلومات" },
    ],
  },
];

// Flat list of all subjects for easy access
export const allSubjects = subjectCategories.flatMap((cat) => cat.subjects);

// Get subject label by id (now they're the same)
export const getSubjectLabel = (id: string): string => {
  const subject = allSubjects.find((s) => s.id === id);
  return subject?.label || id;
};
