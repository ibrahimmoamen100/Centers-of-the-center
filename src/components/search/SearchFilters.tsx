import { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { governorates, areasByGovernorate, type Governorate } from "@/data/locations";
import { subjectCategories, allSubjects, getSubjectLabel } from "@/data/subjects";

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  governorate: string;
  area: string;
  stage: string;
  grade: string;
  subjects: string[];
}

// ✅ القيم باللغة العربية (تطابق ما هو مخزن في Firebase)
const stages = [
  { value: "المرحلة الإعدادية", label: "المرحلة الإعدادية" },
  { value: "المرحلة الثانوية", label: "المرحلة الثانوية" },
];

// ✅ الصفوف باللغة العربية (تطابق Firebase)
const gradesByStage: Record<string, { value: string; label: string }[]> = {
  "المرحلة الإعدادية": [
    { value: "الصف الأول الإعدادي", label: "الصف الأول الإعدادي" },
    { value: "الصف الثاني الإعدادي", label: "الصف الثاني الإعدادي" },
    { value: "الصف الثالث الإعدادي", label: "الصف الثالث الإعدادي" },
  ],
  "المرحلة الثانوية": [
    { value: "الصف الأول الثانوي", label: "الصف الأول الثانوي" },
    { value: "الصف الثاني الثانوي", label: "الصف الثاني الثانوي" },
    { value: "الصف الثالث الثانوي", label: "الصف الثالث الثانوي" },
  ],
};

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    governorate: "",
    area: "",
    stage: "",
    grade: "",
    subjects: [],
  });

  const availableAreas = filters.governorate
    ? areasByGovernorate[filters.governorate as Governorate]
    : [];

  const availableGrades = filters.stage
    ? gradesByStage[filters.stage] || []
    : [];

  const handleFilterChange = (key: keyof Omit<FilterState, 'subjects'>, value: string) => {
    let newFilters = { ...filters, [key]: value };

    // Reset dependent fields
    if (key === "governorate") {
      newFilters.area = "";
    }
    if (key === "stage") {
      newFilters.grade = "";
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    const newSubjects = checked
      ? [...filters.subjects, subjectId]
      : filters.subjects.filter((s) => s !== subjectId);

    const newFilters = { ...filters, subjects: newSubjects };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      governorate: "",
      area: "",
      stage: "",
      grade: "",
      subjects: [],
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount =
    Object.entries(filters)
      .filter(([key, value]) => {
        if (key === 'subjects') return (value as string[]).length > 0;
        return Boolean(value);
      }).length;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">تصفية النتائج</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 ml-1" />
              مسح الكل
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${!isExpanded && "hidden md:grid"}`}>
        {/* Governorate */}
        <Select
          value={filters.governorate}
          onValueChange={(value) => handleFilterChange("governorate", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="المحافظة" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            {governorates.map((gov) => (
              <SelectItem key={gov} value={gov}>
                {gov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Area - Dependent on Governorate */}
        <Select
          value={filters.area}
          onValueChange={(value) => handleFilterChange("area", value)}
          disabled={!filters.governorate}
        >
          <SelectTrigger>
            <SelectValue placeholder={filters.governorate ? "المنطقة" : "اختر المحافظة أولاً"} />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            {availableAreas.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stage */}
        <Select
          value={filters.stage}
          onValueChange={(value) => handleFilterChange("stage", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="المرحلة الدراسية" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {stages.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grade - Dependent on Stage */}
        <Select
          value={filters.grade}
          onValueChange={(value) => handleFilterChange("grade", value)}
          disabled={!filters.stage}
        >
          <SelectTrigger>
            <SelectValue placeholder={filters.stage ? "الصف الدراسي" : "اختر المرحلة أولاً"} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {availableGrades.map((grade) => (
              <SelectItem key={grade.value} value={grade.value}>
                {grade.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subjects Multi-Select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between h-10 font-normal">
              {filters.subjects.length > 0 ? (
                <span className="truncate">
                  {filters.subjects.length === 1
                    ? getSubjectLabel(filters.subjects[0])
                    : `${filters.subjects.length} مواد`
                  }
                </span>
              ) : (
                <span className="text-muted-foreground">المواد الدراسية</span>
              )}
              <ChevronDown className="h-4 w-4 mr-2 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-popover" align="start">
            <div className="p-4 max-h-80 overflow-y-auto">
              {subjectCategories.map((category) => (
                <div key={category.id} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {category.label}
                  </h4>
                  <div className="space-y-2">
                    {category.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`filter-${subject.id}`}
                          checked={filters.subjects.includes(subject.id)}
                          onCheckedChange={(checked) =>
                            handleSubjectToggle(subject.id, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`filter-${subject.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {subject.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {filters.subjects.length > 0 && (
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const newFilters = { ...filters, subjects: [] };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                >
                  مسح اختيار المواد
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Subjects Tags */}
      {filters.subjects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {filters.subjects.map((subjectId) => (
              <span
                key={subjectId}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                {getSubjectLabel(subjectId)}
                <button
                  onClick={() => handleSubjectToggle(subjectId, false)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
