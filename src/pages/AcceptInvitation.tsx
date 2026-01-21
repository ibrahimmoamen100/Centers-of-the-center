import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc, query, collection, where, getDocs, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Invitation } from "@/types/auth";
import { SEO } from "@/components/common/SEO";

export default function AcceptInvitation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const token = searchParams.get("token");
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        displayName: "",
        password: "",
        confirmPassword: "",
    });

    // Fetch invitation by token
    useEffect(() => {
        if (!token) {
            setError("رمز الدعوة غير موجود");
            setLoading(false);
            return;
        }

        const fetchInvitation = async () => {
            try {
                const q = query(
                    collection(db, "invitations"),
                    where("token", "==", token),
                    where("status", "==", "pending")
                );

                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError("الدعوة غير موجودة أو تم قبولها مسبقاً");
                    setLoading(false);
                    return;
                }

                const invitationDoc = querySnapshot.docs[0];
                const invitationData = {
                    id: invitationDoc.id,
                    ...invitationDoc.data()
                } as Invitation;

                // Check if invitation expired
                const now = new Date();
                const expiresAt = new Date((invitationData.expiresAt as any).seconds * 1000);

                if (now > expiresAt) {
                    setError("انتهت صلاحية هذه الدعوة");

                    // Update invitation status to expired
                    await updateDoc(doc(db, "invitations", invitationDoc.id), {
                        status: "expired"
                    });

                    setLoading(false);
                    return;
                }

                setInvitation(invitationData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching invitation:", err);
                setError("حدث خطأ أثناء جلب بيانات الدعوة");
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [token]);

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!invitation) return;

        // If user is already logged in, just update their role
        if (user) {
            setAccepting(true);
            try {
                // Update user document
                await updateDoc(doc(db, "users", user.uid), {
                    role: "center_admin",
                    centerId: invitation.centerId,
                    updatedAt: serverTimestamp(),
                });

                // Update center with admin UID
                await updateDoc(doc(db, "centers", invitation.centerId), {
                    adminUid: user.uid,
                    updatedAt: serverTimestamp(),
                });

                // Update invitation status
                await updateDoc(doc(db, "invitations", invitation.id), {
                    status: "accepted",
                    acceptedAt: serverTimestamp(),
                });

                toast.success("تم قبول الدعوة بنجاح!");
                navigate("/center/dashboard");
            } catch (err) {
                console.error("Error accepting invitation:", err);
                toast.error("حدث خطأ أثناء قبول الدعوة");
            } finally {
                setAccepting(false);
            }
            return;
        }

        // User needs to register
        if (formData.password !== formData.confirmPassword) {
            toast.error("كلمات المرور غير متطابقة");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        setAccepting(true);
        try {
            // Create Firebase Auth account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                invitation.email,
                formData.password
            );
            const uid = userCredential.user.uid;

            // Create user document
            await setDoc(doc(db, "users", uid), {
                uid,
                email: invitation.email,
                role: "center_admin",
                centerId: invitation.centerId,
                status: "active",
                displayName: formData.displayName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Update center with admin UID
            await updateDoc(doc(db, "centers", invitation.centerId), {
                adminUid: uid,
                email: invitation.email,
                updatedAt: serverTimestamp(),
            });

            // Update invitation status
            await updateDoc(doc(db, "invitations", invitation.id), {
                status: "accepted",
                acceptedAt: serverTimestamp(),
            });

            toast.success("تم إنشاء حسابك وقبول الدعوة بنجاح!");
            navigate("/center/dashboard");
        } catch (err: any) {
            console.error("Error creating account:", err);
            let errorMessage = "حدث خطأ أثناء إنشاءal الحساب";

            if (err.code === 'auth/email-already-in-use') {
                errorMessage = "البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول";
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "كلمة المرور ضعيفة جداً";
            }

            toast.error(errorMessage);
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">جاري التحقق من الدعوة...</p>
                </div>
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <CardTitle className="text-red-600">دعوة غير صالحة</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => navigate("/")}
                            className="w-full"
                            variant="outline"
                        >
                            العودة للصفحة الرئيسية
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
            <SEO title="قبول الدعوة" description="صفحة قبول دعوة الانضمام لإدارة مركز تعليمي." />
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <CardTitle>دعوة لإدارة مركز</CardTitle>
                    <CardDescription>
                        تمت دعوتك لتكون مسؤولاً عن <strong>{invitation.centerName}</strong>
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {user ? (
                        // User is already logged in
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    أنت مسجل الدخول حالياً بالبريد: <strong>{user.email}</strong>
                                </p>
                                {user.email !== invitation.email && (
                                    <p className="text-xs text-red-600 mt-2">
                                        ⚠️ تنبيه: البريد الإلكتروني المدعو ({invitation.email}) يختلف عن حسابك الحالي
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleAccept}
                                className="w-full"
                                disabled={accepting}
                            >
                                {accepting ? "جاري القبول..." : "قبول الدعوة"}
                            </Button>
                        </div>
                    ) : (
                        // User needs to register
                        <form onSubmit={handleAccept} className="space-y-4">
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                                <p>البريد الإلكتروني: <strong>{invitation.email}</strong></p>
                                <p className="text-xs mt-1">لقبول الدعوة، قم بإنشاء حساب جديد</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName">الاسم</Label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="displayName"
                                        placeholder="اسمك الكامل"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={accepting}
                            >
                                {accepting ? "جاري الإنشاء..." : "إنشاء الحساب وقبول الدعوة"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
