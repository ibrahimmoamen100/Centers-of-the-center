import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/common/SEO";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signIn(formData.email, formData.password);
            toast.success("تم تسجيل الدخول بنجاح");
            navigate("/admin/dashboard");
        } catch (error: any) {
            console.error("Login error:", error);
            let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

            if (error.code === 'auth/user-not-found') {
                errorMessage = "البريد الإلكتروني غير مسجل";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "كلمة المرور غير صحيحة";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "تم تجاوز عدد المحاولات. حاول لاحقاً";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "البريد الإلكتروني غير صحيح";
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
            <SEO title="تسجيل دخول المسؤول" />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">لوحة تحكم المسؤول</CardTitle>
                    <CardDescription>قم بتسجيل الدخول للوصول إلى لوحة التحكم الرئيسية</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    autoComplete="current-password"
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
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                            disabled={isLoading}
                        >
                            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
