import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Send, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Invitation, Center } from "@/types/auth";

// Helper function to generate unique token
function generateUniqueToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function InvitationsManagement() {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingInvite, setSendingInvite] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        centerId: "",
        centerName: "",
    });

    // Fetch invitations
    useEffect(() => {
        const q = query(
            collection(db, "invitations"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const invitationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Invitation));
            setInvitations(invitationsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch centers
    useEffect(() => {
        const q = query(
            collection(db, "centers"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const centersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Center));
            setCenters(centersData);
        });

        return () => unsubscribe();
    }, []);

    const handleSendInvitation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("يجب تسجيل الدخول أولاً");
            return;
        }

        if (!formData.email || !formData.centerId) {
            toast.error("يرجى ملء جميع الحقول");
            return;
        }

        setSendingInvite(true);

        try {
            const token = generateUniqueToken();
            const selectedCenter = centers.find(c => c.id === formData.centerId);

            await addDoc(collection(db, "invitations"), {
                email: formData.email,
                role: "center_admin",
                centerId: formData.centerId,
                centerName: selectedCenter?.name || formData.centerName,
                invitedBy: user.uid,
                status: "pending",
                token,
                expiresAt: Timestamp.fromDate(
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                ),
                createdAt: serverTimestamp(),
            });

            // Generate invitation link
            const invitationLink = `${window.location.origin}/invitation/accept?token=${token}`;

            toast.success(
                <div>
                    <p>تم إرسال الدعوة بنجاح!</p>
                    <p className="text-xs mt-1">الرابط: {invitationLink}</p>
                </div>,
                { duration: 10000 }
            );

            // Reset form
            setFormData({ email: "", centerId: "", centerName: "" });
        } catch (error) {
            console.error("Error sending invitation:", error);
            toast.error("حدث خطأ أثناء إرسال الدعوة");
        } finally {
            setSendingInvite(false);
        }
    };

    const handleCenterSelect = (centerId: string) => {
        const selectedCenter = centers.find(c => c.id === centerId);
        setFormData({
            ...formData,
            centerId,
            centerName: selectedCenter?.name || "",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> قيد الانتظار</Badge>;
            case "accepted":
                return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" /> مقبولة</Badge>;
            case "rejected":
                return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> مرفوضة</Badge>;
            case "expired":
                return <Badge variant="secondary" className="gap-1">منتهية الصلاحية</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Send New Invitation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        إرسال دعوة جديدة
                    </CardTitle>
                    <CardDescription>
                        قم بدعوة مسؤول جديد لإدارة أحد المراكز
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendInvitation} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني للمدعو</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="center">اختر المركز</Label>
                                <select
                                    id="center"
                                    value={formData.centerId}
                                    onChange={(e) => handleCenterSelect(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    required
                                >
                                    <option value="">-- اختر مركزاً --</option>
                                    {centers.map((center) => (
                                        <option key={center.id} value={center.id}>
                                            {center.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="gap-2"
                            disabled={sendingInvite}
                        >
                            <Send className="w-4 h-4" />
                            {sendingInvite ? "جاري الإرسال..." : "إرسال الدعوة"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Invitations List */}
            <Card>
                <CardHeader>
                    <CardTitle>الدعوات المرسلة ({invitations.length})</CardTitle>
                    <CardDescription>قائمة بجميع الدعوات التي تم إرسالها</CardDescription>
                </CardHeader>
                <CardContent>
                    {invitations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>لا توجد دعوات حتى الآن</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{invitation.email}</p>
                                                {getStatusBadge(invitation.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                المركز: {invitation.centerName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                تاريخ الإرسال: {invitation.createdAt &&
                                                    new Date((invitation.createdAt as any).seconds * 1000).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>

                                        {invitation.status === "pending" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const link = `${window.location.origin}/invitation/accept?token=${invitation.token}`;
                                                    navigator.clipboard.writeText(link);
                                                    toast.success("تم نسخ رابط الدعوة");
                                                }}
                                            >
                                                نسخ الرابط
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
