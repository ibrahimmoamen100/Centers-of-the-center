import { useState } from "react";
import { Save, Upload, AlertTriangle, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { governorates, areasByGovernorate, type Governorate } from "@/data/locations";
import { subjectCategories } from "@/data/subjects";

interface CenterSettingsProps {
  canEdit: boolean;
  remainingOps: number;
}

const stages = [
  { id: "preparatory", label: "المرحلة الإعدادية" },
  { id: "secondary", label: "المرحلة الثانوية" },
];

const grades = {
  preparatory: [
    { id: "prep1", label: "الصف الأول الإعدادي" },
    { id: "prep2", label: "الصف الثاني الإعدادي" },
    { id: "prep3", label: "الصف الثالث الإعدادي" },
  ],
  secondary: [
    { id: "sec1", label: "الصف الأول الثانوي" },
    { id: "sec2", label: "الصف الثاني الثانوي" },
    { id: "sec3", label: "الصف الثالث الثانوي" },
  ],
};

export function CenterSettings({ canEdit, remainingOps }: CenterSettingsProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    centerName: "مركز النور التعليمي",
    description: "مركز تعليمي متخصص في المرحلة الثانوية، يقدم أفضل المدرسين في جميع المواد",
    phone: "01012345678",
    whatsapp: "01012345678",
    governorate: "القاهرة" as Governorate | "",
    area: "مدينة نصر",
    facebook: "https://facebook.com/alnoor",
    instagram: "",
    selectedStages: ["secondary"],
    selectedGrades: ["sec1", "sec2", "sec3"],
    selectedSubjects: ["physics", "chemistry", "arabic", "english"],
  });

  const availableAreas = formData.governorate 
    ? areasByGovernorate[formData.governorate as Governorate] 
    : [];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGovernorateChange = (value: string) => {
    setFormData({
      ...formData,
      governorate: value as Governorate,
      area: "", // Reset area when governorate changes
    });
  };

  const handleStageChange = (stageId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedStages: [...formData.selectedStages, stageId],
      });
    } else {
      setFormData({
        ...formData,
        selectedStages: formData.selectedStages.filter((s) => s !== stageId),
        selectedGrades: formData.selectedGrades.filter(
          (g) => !grades[stageId as keyof typeof grades]?.some((grade) => grade.id === g)
        ),
      });
    }
  };

  const handleGradeChange = (gradeId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedGrades: [...formData.selectedGrades, gradeId],
      });
    } else {
      setFormData({
        ...formData,
        selectedGrades: formData.selectedGrades.filter((g) => g !== gradeId),
      });
    }
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedSubjects: [...formData.selectedSubjects, subjectId],
      });
    } else {
      setFormData({
        ...formData,
        selectedSubjects: formData.selectedSubjects.filter((s) => s !== subjectId),
      });
    }
  };

  const handleSave = () => {
    if (!canEdit) return;
    if (!formData.governorate) {
      alert("يجب اختيار المحافظة");
      return;
    }
    console.log("Saving center data:", formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">بيانات المركز</h1>
          <p className="text-muted-foreground">تعديل معلومات المركز التعليمي</p>
        </div>
        
        <Button onClick={handleSave} disabled={!canEdit} className="gap-2">
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>

      {!canEdit && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">
              انتهت العمليات المتاحة. جدد اشتراكك للاستمرار في التعديل.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div className="space-y-2">
              <Label>شعار المركز</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={!canEdit}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>اسم المركز</Label>
              <Input
                value={formData.centerName}
                onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label>وصف المركز</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!canEdit}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              الموقع الجغرافي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>المحافظة <span className="text-destructive">*</span></Label>
              <Select
                value={formData.governorate}
                onValueChange={handleGovernorateChange}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المنطقة</Label>
              <Select
                value={formData.area}
                onValueChange={(value) => setFormData({ ...formData, area: value })}
                disabled={!canEdit || !formData.governorate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.governorate ? "اختر المنطقة" : "اختر المحافظة أولاً"} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات التواصل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label>واتساب</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label>فيسبوك</Label>
              <Input
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                disabled={!canEdit}
                placeholder="رابط صفحة الفيسبوك"
              />
            </div>

            <div className="space-y-2">
              <Label>انستغرام</Label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                disabled={!canEdit}
                placeholder="رابط حساب الانستغرام"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stages & Grades */}
        <Card>
          <CardHeader>
            <CardTitle>المراحل والصفوف الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stages.map((stage) => (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={stage.id}
                      checked={formData.selectedStages.includes(stage.id)}
                      onCheckedChange={(checked) => handleStageChange(stage.id, checked as boolean)}
                      disabled={!canEdit}
                    />
                    <Label htmlFor={stage.id} className="font-medium cursor-pointer">
                      {stage.label}
                    </Label>
                  </div>
                  
                  {formData.selectedStages.includes(stage.id) && (
                    <div className="mr-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {grades[stage.id as keyof typeof grades].map((grade) => (
                        <div key={grade.id} className="flex items-center gap-2">
                          <Checkbox
                            id={grade.id}
                            checked={formData.selectedGrades.includes(grade.id)}
                            onCheckedChange={(checked) => handleGradeChange(grade.id, checked as boolean)}
                            disabled={!canEdit}
                          />
                          <Label htmlFor={grade.id} className="text-sm cursor-pointer">
                            {grade.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              المواد الدراسية التي يدرسها المركز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subjectCategories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <h4 className="font-semibold text-foreground border-b border-border pb-2">
                    {category.label}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {category.subjects.map((subject) => (
                      <div 
                        key={subject.id} 
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                          formData.selectedSubjects.includes(subject.id)
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <Checkbox
                          id={subject.id}
                          checked={formData.selectedSubjects.includes(subject.id)}
                          onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                          disabled={!canEdit}
                        />
                        <Label htmlFor={subject.id} className="text-sm cursor-pointer flex-1">
                          {subject.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {formData.selectedSubjects.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  المواد المختارة: <span className="font-medium text-foreground">{formData.selectedSubjects.length}</span> مادة
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
