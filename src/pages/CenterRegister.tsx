import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Eye, EyeOff, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

// Helper function to sanitize data and remove undefined values (Technical Note Requirement)
const sanitizeData = (data: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    // Convert undefined to null because Firestore does not support undefined
    cleaned[key] = value === undefined ? null : value;
  });
  return cleaned;
};

export default function CenterRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    centerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    selectedStages: [] as string[],
    selectedGrades: [] as string[],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting registration process (v2 - Sanitized)...");
      // 1. Create Firebase Authentication User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCredential.user.uid;
      console.log("Auth user created:", uid);

      // Prepare stage display name
      const stageLabels = formData.selectedStages
        .map(stageId => stages.find(s => s.id === stageId)?.label || stageId)
        .join(" - ");

      // 2. Create Center Document in Firestore
      const centerRef = doc(db, "centers", uid);

      const centerData = {
        // Display fields
        name: formData.centerName,
        logo: logoPreview ?? null,
        location: formData.address,
        stage: stageLabels || "غير محدد",
        subjects: [],
        rating: 0,
        reviewCount: 0,
        teacherCount: 0,

        // Admin fields
        id: uid,
        email: formData.email,
        adminUid: uid,
        phone: formData.phone,
        address: formData.address,
        selectedStages: formData.selectedStages,
        selectedGrades: formData.selectedGrades,

        // Metadata
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: uid,

        // Subscription
        subscription: {
          status: "active",
          amount: 300,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        operationsUsed: 0,
        operationsLimit: 10,
      };

      // Sanitize data before sending to Firestore
      await setDoc(centerRef, sanitizeData(centerData));
      console.log("Center document created (Sanitized)");

      // 3. Create User Document
      const userData = {
        uid,
        email: formData.email,
        role: "center_admin",
        centerId: uid,
        status: "pending",
        displayName: formData.centerName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", uid), sanitizeData(userData));
      console.log("User document created with role");

      toast.success("تم إنشاء الحساب بنجاح! في انتظار الموافقة من المسؤول");
      navigate("/center/dashboard");

    } catch (error: any) {
      console.error("Registration error:", error);

      // Rollback: Delete the auth user if Firestore creation fails
      if (auth.currentUser) {
        try {
          console.log("Rolling back auth user due to error...");
          await deleteUser(auth.currentUser);
          console.log("Auth user rolled back successfully");
        } catch (rollbackError) {
          console.error("Failed to rollback auth user:", rollbackError);
        }
      }

      let errorMessage = "حدث خطأ أثناء إنشاء الحساب";

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "البريد الإلكتروني مستخدم بالفعل";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور ضعيفة جدًا (يجب أن تكون 6 أحرف على الأقل)";
      } else if (error.code === 'permission-denied') {
        errorMessage = "لا تملك الصلاحيات اللازمة (يرجى التأكد من رفع قواعد الأمان).";
      } else if (error.message && error.message.includes("undefined")) {
        errorMessage = "حدث خطأ في البيانات (قيمة غير معرفة). تم إلغاء العملية.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">تسجيل مركز جديد</CardTitle>
              <CardDescription>أنشئ حسابًا لمركزك التعليمي وابدأ في عرض خدماتك</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>شعار المركز</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Center Name */}
                <div className="space-y-2">
                  <Label htmlFor="centerName">اسم المركز *</Label>
                  <Input
                    id="centerName"
                    placeholder="مثال: مركز النور التعليمي"
                    value={formData.centerName}
                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="كلمة المرور"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="أعد كتابة كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Phone & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان *</Label>
                    <Input
                      id="address"
                      placeholder="المحافظة - المنطقة"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Stages Selection */}
                <div className="space-y-4">
                  <Label>المراحل الدراسية *</Label>
                  <div className="space-y-4">
                    {stages.map((stage) => (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={stage.id}
                            checked={formData.selectedStages.includes(stage.id)}
                            onCheckedChange={(checked) => handleStageChange(stage.id, checked as boolean)}
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
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  <UserPlus className="h-4 w-4" />
                  {isLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  لديك حساب بالفعل؟{" "}
                  <Link to="/center/login" className="text-primary hover:underline font-medium">
                    تسجيل الدخول
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
