import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, setDoc, getDocs, query, where, collection, serverTimestamp, limit } from "firebase/firestore";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { governorates, areasByGovernorate, type Governorate } from "@/data/locations";
import { allSubjects } from "@/data/subjects";
import { SEO } from "@/components/common/SEO";

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

  const [formData, setFormData] = useState({
    centerName: "",
    centerUsername: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    governorate: "",
    area: "",
    logoUrl: "",
    selectedStages: [] as string[],
    selectedGrades: [] as string[],
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  // Debounce username check
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.centerUsername;
      if (!username) {
        setUsernameStatus('idle');
        return;
      }

      const isValid = /^[a-z0-9-]+$/.test(username);
      if (!isValid) {
        setUsernameStatus('invalid');
        return;
      }

      setUsernameStatus('checking');
      try {
        const q = query(collection(db, "centers"), where("centerUsername", "==", username), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameStatus('idle');
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.centerUsername]);

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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, '-');
    setFormData({ ...formData, centerUsername: value });
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

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      toast.error("يرجى اختيار اسم مستخدم صالح وغير مستخدم");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting registration process...");

      // Final check for username uniqueness just in case
      const q = query(collection(db, "centers"), where("centerUsername", "==", formData.centerUsername), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        toast.error("اسم المستخدم تم حجزه للتو، يرجى اختيار اسم آخر");
        setIsLoading(false);
        return;
      }

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
        centerUsername: formData.centerUsername,
        logo: formData.logoUrl || null,

        // Location fields
        governorate: formData.governorate,
        area: formData.area,
        location: `${formData.governorate} - ${formData.area}`, // For backward compatibility/display
        address: `${formData.governorate} - ${formData.area}`, // Fallback

        stage: stageLabels || "غير محدد",
        subjects: allSubjects.map(s => s.label),
        rating: 0,
        reviewCount: 0,
        teacherCount: 0,

        // Admin fields
        id: uid,
        email: formData.email,
        adminUid: uid,
        phone: formData.phone,
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

        // Default Opening/Closing times (can be edited later)
        openingTime: "09:00",
        closingTime: "22:00"
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
      <SEO title="تسجيل مركز جديد" description="انضم لمنصة دليل المراكز التعليمية. سجل مركزك الآن وقم بإدارة جداول الحصص والمدرسين بسهولة." />
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

                {/* Logo URL */}
                <div className="space-y-3">
                  <Label htmlFor="logoUrl">رابط شعار المركز (اختياري)</Label>
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-lg border flex items-center justify-center bg-muted overflow-hidden flex-shrink-0">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                      ) : (
                        <LinkIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        id="logoUrl"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="text-left ltr"
                        dir="ltr"
                      />
                      <p className="text-xs text-muted-foreground">أدخل رابط مباشر للصورة من آي كلاود أو جوجل درايف أو أي خدمة استضافة.</p>
                    </div>
                  </div>
                </div>

                {/* Center Name & Username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="centerUsername" className="flex items-center gap-2">
                      اسم المستخدم (Rابط المركز) *
                      {usernameStatus === 'checking' && <span className="text-xs text-muted-foreground animate-pulse">جاري التحقق...</span>}
                      {usernameStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {usernameStatus === 'taken' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </Label>
                    <div className="relative">
                      <Input
                        id="centerUsername"
                        placeholder="future-center"
                        value={formData.centerUsername}
                        onChange={handleUsernameChange}
                        className={`text-left ltr ${usernameStatus === 'taken' ? 'border-destructive' : usernameStatus === 'available' ? 'border-green-500' : ''}`}
                        dir="ltr"
                        required
                        pattern="^[a-z0-9-]+$"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-left ltr">
                        /center/{formData.centerUsername || 'username'}
                      </p>
                    </div>
                    {usernameStatus === 'taken' && <p className="text-xs text-destructive">اسم المستخدم هذا محجوز مسبقاً</p>}
                    {usernameStatus === 'invalid' && <p className="text-xs text-destructive">مسموح فقط بالأحرف الإنجليزية الصغيرة والأرقام والشرطة (-)</p>}
                  </div>
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

                {/* Phone & Location */}
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

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>المحافظة *</Label>
                      <Select
                        value={formData.governorate}
                        onValueChange={(val) => setFormData({ ...formData, governorate: val, area: "" })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {governorates.map((gov) => (
                            <SelectItem key={gov} value={gov}>
                              {gov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>المنطقة *</Label>
                      <Select
                        value={formData.area}
                        onValueChange={(val) => setFormData({ ...formData, area: val })}
                        disabled={!formData.governorate}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {formData.governorate && areasByGovernorate[formData.governorate as Governorate]?.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                <Button type="submit" className="w-full gap-2" disabled={isLoading || (formData.centerUsername && usernameStatus === 'taken')}>
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
