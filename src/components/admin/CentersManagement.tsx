import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Eye, Edit, Archive, Trash2, RotateCcw, CheckCircle, Sliders, CreditCard, MapPin, Receipt, Calendar, Building2, Users, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// Interface matching Firestore Schema
interface Payment {
  id?: string;
  centerId: string;
  centerName: string;
  amount: number;
  paymentType: string;
  date: string;
  notes?: string;
  subscriptionMonths: number;
}

interface Center {
  id: string;
  name: string;
  logo?: string;
  phone: string;
  address: string;
  governorate?: string;
  area?: string;
  description?: string;
  stage?: string; // Legacy
  stages?: string[]; // New
  grades?: string[]; // New
  subjects?: string[];
  workingHours?: string;
  status: "active" | "archived" | "pending" | "expired";
  subscription: {
    status: "active" | "expired" | "pending";
    startDate?: string;
    endDate?: string;
    amount?: number;
    paymentType?: string;
  };
  operationsUsed: number;
  operationsLimit: number;
  teacherCount?: number;
  paymentHistory?: Payment[];
  displayPriority?: number | null; // ترتيب الأولوية
}

// Payment History Table Component
function PaymentHistoryTable({ centerId }: { centerId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!centerId) return;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "payments"),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const allPayments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Payment));

        // Filter payments for this center
        const centerPayments = allPayments.filter(p => p.centerId === centerId);
        setPayments(centerPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [centerId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>لا توجد سجلات مدفوعات لهذا المركز</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-lg">{payment.amount} ج.م</span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(payment.date)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{payment.paymentType}</Badge>
                  <Badge variant="secondary">{payment.subscriptionMonths} شهر</Badge>
                </div>
                {payment.notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{payment.notes}"
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">إجمالي المدفوعات:</span>
          <span className="font-bold text-lg text-green-600">
            {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} ج.م
          </span>
        </div>
      </div>
    </div>
  );
}


export function CentersManagement() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Dialog States
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] = useState(false);

  // Renew / Approve Form State
  const [renewForm, setRenewForm] = useState({ durationMonths: 1, amount: 300, paymentType: "cash", notes: "" });

  // Limit Form State
  const [limitForm, setLimitForm] = useState({ newLimit: 10, extraCost: 0 });

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({ amount: 300, paymentType: "cash", notes: "", subscriptionMonths: 1 });

  // Priority Form State
  const [priorityForm, setPriorityForm] = useState<{ priority: number | null }>({ priority: null });

  // Fetch Centers
  const fetchCenters = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "centers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Center[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Center));
      setCenters(data);
    } catch (error) {
      console.error("Error fetching centers:", error);
      toast.error("فشل تحميل بيانات المراكز");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // Filter Logic


  // Auto-Archive Logic (Run once locally on load)
  useEffect(() => {
    const checkExpiry = async () => {
      if (centers.length === 0) return;
      const now = new Date();
      centers.forEach(async (center) => {
        if (center.status === "active" && center.subscription?.endDate) {
          const endDate = new Date(center.subscription.endDate);
          if (endDate < now) {
            // Auto Archive
            try {
              await updateDoc(doc(db, "centers", center.id), { status: "archived", "subscription.status": "expired" });
              console.log(`Auto-archived center ${center.name}`);
            } catch (e) {
              console.error("Failed to auto-archive", e);
            }
          }
        }
      });
    };
    checkExpiry();
  }, [centers]);

  // Filter Logic
  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.phone?.includes(searchQuery) ||
      center.address?.includes(searchQuery);

    let matchesStatus = false;
    if (activeTab === "all") matchesStatus = true;
    else if (activeTab === "active") matchesStatus = center.status === "active";
    else if (activeTab === "pending") matchesStatus = center.status === "pending";
    else if (activeTab === "archived") matchesStatus = center.status === "archived" || center.status === "expired";

    return matchesSearch && matchesStatus;
  });

  const validateCenter = (center: Center) => {
    const missing = [];
    if (!center.governorate) missing.push("المحافظة");
    if (!center.area) missing.push("المنطقة");
    if (!center.address) missing.push("العنوان التفصيلي");
    if (!center.stages || center.stages.length === 0) missing.push("المراحل الدراسية");
    if (!center.grades || center.grades.length === 0) missing.push("الصفوف الدراسية");
    if (!center.workingHours) missing.push("مواعيد العمل");
    return missing;
  };

  // Actions
  const handleApproveOrRenew = async () => {
    if (!selectedCenter) return;

    // Validation for activation
    if (selectedCenter.status === 'pending' || selectedCenter.status === 'archived') {
      const missingFields = validateCenter(selectedCenter);
      if (missingFields.length > 0) {
        toast.error(`لا يمكن تفعيل المركز. بيانات ناقصة: ${missingFields.join(", ")}`);
        return;
      }
    }

    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + (renewForm.durationMonths * 30));

      await updateDoc(doc(db, "centers", selectedCenter.id), {
        status: "active",
        "subscription.status": "active",
        "subscription.startDate": now.toISOString(),
        "subscription.endDate": endDate.toISOString(),
        "subscription.amount": renewForm.amount,
        "subscription.paymentType": renewForm.paymentType,
        // Reset limits on renewal
        operationsUsed: 0,
        operationsLimit: 10
      });

      toast.success("تم تحديث اشتراك المركز بنجاح");
      setIsRenewDialogOpen(false);
      fetchCenters(); // Refresh
    } catch (error) {
      console.error(error);
      toast.error("فشل تحديث الاشتراك");
    }
  };

  const handleUpdateLimit = async () => {
    if (!selectedCenter) return;

    try {
      await updateDoc(doc(db, "centers", selectedCenter.id), {
        operationsLimit: limitForm.newLimit
      });

      toast.success("تم تحديث حد التعديلات بنجاح");
      setIsLimitDialogOpen(false);
      fetchCenters();
    } catch (error) {
      console.error(error);
      toast.error("فشل تحديث الحد");
    }
  };

  const handleArchive = async (center: Center) => {
    try {
      await updateDoc(doc(db, 'centers', center.id), { status: 'archived' });
      toast.success("تم أرشفة المركز");
      fetchCenters();
    } catch (e) { toast.error("فشل الأرشفة"); }
  };

  const handleRestore = async (center: Center) => {
    try {
      await updateDoc(doc(db, 'centers', center.id), { status: 'active' });
      toast.success("تم استعادة المركز");
      fetchCenters();
    } catch (e) { toast.error("فشل الاستعادة"); }
  };

  const handleRecordPayment = async () => {
    if (!selectedCenter) return;

    try {
      const payment: Payment = {
        centerId: selectedCenter.id,
        centerName: selectedCenter.name,
        amount: paymentForm.amount,
        paymentType: paymentForm.paymentType,
        date: new Date().toISOString(),
        notes: paymentForm.notes,
        subscriptionMonths: paymentForm.subscriptionMonths
      };

      // Add to payments collection
      await addDoc(collection(db, "payments"), payment);

      toast.success("تم تسجيل الدفعة بنجاح");
      setIsPaymentDialogOpen(false);
      setPaymentForm({ amount: 300, paymentType: "cash", notes: "", subscriptionMonths: 1 });
      fetchCenters();
    } catch (error) {
      console.error(error);
      toast.error("فشل تسجيل الدفعة");
    }
  };

  // Handle Priority Update
  const handleUpdatePriority = async () => {
    if (!selectedCenter) return;

    try {
      const newPriority = priorityForm.priority;

      // Validation: Check if priority already exists (if not null)
      if (newPriority !== null) {
        const duplicate = centers.find(
          (c) => c.id !== selectedCenter.id && c.displayPriority === newPriority
        );

        if (duplicate) {
          toast.error(`الأولوية ${newPriority} مستخدمة بالفعل للمركز "${duplicate.name}"`);
          return;
        }

        // Validate positive integer
        if (newPriority < 1 || !Number.isInteger(newPriority)) {
          toast.error("يرجى إدخال رقم صحيح موجب (1, 2, 3, ...)");
          return;
        }
      }

      // Update Firestore
      await updateDoc(doc(db, "centers", selectedCenter.id), {
        displayPriority: newPriority,
      });

      toast.success("تم تحديث أولوية الظهور بنجاح");
      setIsPriorityDialogOpen(false);
      setPriorityForm({ priority: null });
      fetchCenters();
    } catch (error) {
      console.error(error);
      toast.error("فشل تحديث الأولوية");
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">نشط</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">قيد الانتظار</Badge>;
      case "expired": return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">منتهي</Badge>;
      case "archived": return <Badge className="bg-muted text-muted-foreground">مؤرشف</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString('ar-EG');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      {/* Header Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">إدارة المراكز</h2>
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
              المراكز النشطة ({centers.filter(c => c.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
              طلبات الانتظار ({centers.filter(c => c.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
              الأرشيف ({centers.filter(c => ['archived', 'expired'].includes(c.status)).length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
              الكل
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-[80px]">الشعار</TableHead>
                    <TableHead className="text-right">بيانات المركز</TableHead>
                    <TableHead className="text-right">تفاصيل الاشتراك</TableHead>
                    <TableHead className="text-right hidden md:table-cell">الاستهلاك / الحد</TableHead>
                    <TableHead className="text-right hidden lg:table-cell w-[120px]">أولوية الظهور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right w-[70px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                          {center.logo ? (
                            <img src={center.logo} alt={center.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground font-bold">{center.name?.[0]}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm hover:underline cursor-pointer" onClick={() => { setSelectedCenter(center); setIsDetailsDialogOpen(true); }}>
                            {center.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {center.governorate || '-'} - {center.area || '-'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{center.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-muted-foreground">ينتهي في: </span>
                          <span className="font-medium">{formatDate(center.subscription?.endDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-[200px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span>{center.operationsUsed || 0} / {center.operationsLimit || 10}</span>
                            <span className="text-muted-foreground">تعديل</span>
                          </div>
                          <Progress value={((center.operationsUsed || 0) / (center.operationsLimit || 10)) * 100} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-16 font-mono"
                          onClick={() => {
                            setSelectedCenter(center);
                            setPriorityForm({ priority: center.displayPriority ?? null });
                            setIsPriorityDialogOpen(true);
                          }}
                        >
                          {center.displayPriority ?? "-"}
                        </Button>
                      </TableCell>
                      <TableCell>{getStatusBadge(center.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">

                            <DropdownMenuItem className="gap-2" onClick={() => {
                              setSelectedCenter(center);
                              setIsDetailsDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>

                            {center.status === 'pending' && (
                              <DropdownMenuItem className="gap-2 text-green-600 font-bold" onClick={() => {
                                setSelectedCenter(center);
                                setRenewForm({ ...renewForm, amount: center.subscription?.amount || 300 });
                                setIsRenewDialogOpen(true);
                              }}>
                                <CheckCircle className="h-4 w-4" />
                                موافقة وتفعيل
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem className="gap-2" onClick={() => {
                              setSelectedCenter(center);
                              setRenewForm({ ...renewForm, amount: center.subscription?.amount || 300 });
                              setIsRenewDialogOpen(true);
                            }}>
                              <CreditCard className="h-4 w-4" />
                              تجديد الاشتراك
                            </DropdownMenuItem>

                            <DropdownMenuItem className="gap-2" onClick={() => {
                              setSelectedCenter(center);
                              setLimitForm({ newLimit: center.operationsLimit || 10, extraCost: 0 });
                              setIsLimitDialogOpen(true);
                            }}>
                              <Sliders className="h-4 w-4" />
                              إدارة حد التعديلات
                            </DropdownMenuItem>

                            <DropdownMenuItem className="gap-2" onClick={() => {
                              setSelectedCenter(center);
                              setPaymentForm({ ...paymentForm, amount: center.subscription?.amount || 300 });
                              setIsPaymentDialogOpen(true);
                            }}>
                              <Receipt className="h-4 w-4" />
                              تسجيل دفعة جديدة
                            </DropdownMenuItem>

                            <DropdownMenuItem className="gap-2" onClick={() => {
                              setSelectedCenter(center);
                              setPriorityForm({ priority: center.displayPriority ?? null });
                              setIsPriorityDialogOpen(true);
                            }}>
                              <Sliders className="h-4 w-4" />
                              أولوية الظهور
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {center.status === "archived" ? (
                              <DropdownMenuItem className="gap-2 text-green-600" onClick={() => handleRestore(center)}>
                                <RotateCcw className="h-4 w-4" />
                                استعادة
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="gap-2 text-amber-600" onClick={() => handleArchive(center)}>
                                <Archive className="h-4 w-4" />
                                أرشفة
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredCenters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد مراكز مطابقة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Details Dialog - Enhanced with Tabs */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted border flex items-center justify-center overflow-hidden">
                  {selectedCenter?.logo ? (
                    <img src={selectedCenter.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : <Building2 className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{selectedCenter?.name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedCenter && getStatusBadge(selectedCenter.status)}
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{selectedCenter?.phone}</span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">معلومات عامة</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">الاشتراك</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden sm:inline">المدفوعات</span>
                </TabsTrigger>
                <TabsTrigger value="edits" className="gap-2">
                  <Sliders className="h-4 w-4" />
                  <span className="hidden sm:inline">التعديلات</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] mt-4">
                {/* General Info Tab */}
                <TabsContent value="general" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        معلومات الموقع
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">المحافظة</Label>
                        <p className="font-medium mt-1">{selectedCenter?.governorate || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">المنطقة</Label>
                        <p className="font-medium mt-1">{selectedCenter?.area || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-muted-foreground">العنوان التفصيلي</Label>
                        <p className="font-medium mt-1">{selectedCenter?.address || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-muted-foreground">مواعيد العمل</Label>
                        <p className="font-medium mt-1">{selectedCenter?.workingHours || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        البيانات الأكاديمية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground mb-2 block">المراحل الدراسية</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedCenter?.stages?.map(s => (
                            <Badge key={s} variant="secondary">{s}</Badge>
                          )) || <span className="text-sm text-muted-foreground">لا توجد مراحل محددة</span>}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground mb-2 block">الصفوف الدراسية</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedCenter?.grades?.map(g => (
                            <Badge key={g} variant="outline">{g}</Badge>
                          )) || <span className="text-sm text-muted-foreground">لا توجد صفوف محددة</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="subscription" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          تفاصيل الاشتراك
                        </div>
                        <Button size="sm" onClick={() => {
                          setRenewForm({ ...renewForm, amount: selectedCenter?.subscription?.amount || 300 });
                          setIsRenewDialogOpen(true);
                        }}>
                          تجديد الآن
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-muted-foreground text-xs">حالة الاشتراك</Label>
                          <div className="mt-2">
                            {selectedCenter && getStatusBadge(selectedCenter.subscription?.status || "pending")}
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">تاريخ البداية</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(selectedCenter?.subscription?.startDate)}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">تاريخ الانتهاء</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(selectedCenter?.subscription?.endDate)}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">قيمة الاشتراك</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-lg">{selectedCenter?.subscription?.amount || 0} ج.م</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">طريقة الدفع</Label>
                          <p className="font-medium mt-2">{selectedCenter?.subscription?.paymentType || '-'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-amber-900 font-semibold">المدة المتبقية</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedCenter?.subscription?.endDate ? (
                              `ينتهي الاشتراك في ${formatDate(selectedCenter.subscription.endDate)}`
                            ) : 'لم يتم تفعيل الاشتراك بعد'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5" />
                          سجل المدفوعات
                        </CardTitle>
                        <Button size="sm" onClick={() => {
                          setPaymentForm({ ...paymentForm, amount: selectedCenter?.subscription?.amount || 300 });
                          setIsPaymentDialogOpen(true);
                        }}>
                          <Receipt className="h-4 w-4 mr-2" />
                          تسجيل دفعة جديدة
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PaymentHistoryTable centerId={selectedCenter?.id || ""} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Edits Tab */}
                <TabsContent value="edits" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="h-5 w-5" />
                          حد التعديلات الشهري
                        </CardTitle>
                        <Button size="sm" onClick={() => {
                          setLimitForm({ newLimit: selectedCenter?.operationsLimit || 10, extraCost: 0 });
                          setIsLimitDialogOpen(true);
                        }}>
                          تعديل الحد
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-2">
                          <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-primary">{selectedCenter?.operationsLimit || 10}</div>
                            <Label className="text-muted-foreground text-xs">الحد المسموح</Label>
                          </CardContent>
                        </Card>
                        <Card className="border-2">
                          <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-amber-600">{selectedCenter?.operationsUsed || 0}</div>
                            <Label className="text-muted-foreground text-xs">المستخدم</Label>
                          </CardContent>
                        </Card>
                        <Card className="border-2">
                          <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-green-600">
                              {(selectedCenter?.operationsLimit || 10) - (selectedCenter?.operationsUsed || 0)}
                            </div>
                            <Label className="text-muted-foreground text-xs">المتبقي</Label>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <Label className="mb-2 block">نسبة الاستهلاك</Label>
                        <Progress
                          value={((selectedCenter?.operationsUsed || 0) / (selectedCenter?.operationsLimit || 10)) * 100}
                          className="h-3"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {((selectedCenter?.operationsUsed || 0) / (selectedCenter?.operationsLimit || 10) * 100).toFixed(1)}%
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <Label className="text-blue-900 font-semibold">إعادة التعيين التلقائية</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              يتم إعادة تعيين عداد التعديلات إلى الصفر تلقائياً في بداية كل شهر
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Renew / Approve Dialog */}
        <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedCenter?.status === 'pending' ? 'تفعيل اشتراك المركز' : 'تجديد اشتراك المركز'}
              </DialogTitle>
              <DialogDescription>
                سيتم تفعيل المركز لمدة 30 يوم (قابلة للتعديل) وإعادة تعيين العدادات.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>مدة الاشتراك (بالأشهر)</Label>
                <Select
                  value={renewForm.durationMonths.toString()}
                  onValueChange={(v) => setRenewForm({ ...renewForm, durationMonths: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">شهر واحد</SelectItem>
                    <SelectItem value="3">3 أشهُر</SelectItem>
                    <SelectItem value="6">6 أشهُر</SelectItem>
                    <SelectItem value="12">سنة كاملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ المدفوع</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={renewForm.amount}
                    onChange={(e) => setRenewForm({ ...renewForm, amount: parseFloat(e.target.value) })}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EGP</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={renewForm.paymentType} onValueChange={(v) => setRenewForm({ ...renewForm, paymentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي (Cash)</SelectItem>
                    <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleApproveOrRenew} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                تأكيد التفعيل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Limit Management Dialog */}
        <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إدارة حد التعديلات</DialogTitle>
              <DialogDescription>
                زيادة الحد المسموح به للتعديلات لهذا الشهر.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">المستخدم حالياً:</span>
                <span className="font-bold">{selectedCenter?.operationsUsed}</span>
              </div>

              <div className="space-y-2">
                <Label>الحد الجديد</Label>
                <Input
                  type="number"
                  value={limitForm.newLimit}
                  onChange={(e) => setLimitForm({ ...limitForm, newLimit: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">الوضع الافتراضي: 10 تعديلات</p>
              </div>

              <div className="space-y-2">
                <Label>تكلفة إضافية (اختياري)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={limitForm.extraCost}
                  onChange={(e) => setLimitForm({ ...limitForm, extraCost: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLimitDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleUpdateLimit}>حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Recording Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
              <DialogDescription>
                تسجيل دفعة جديدة لمركز: {selectedCenter?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>المبلغ المدفوع</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EGP</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={paymentForm.paymentType} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي (Cash)</SelectItem>
                    <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>عدد أشهر الاشتراك</Label>
                <Select
                  value={paymentForm.subscriptionMonths.toString()}
                  onValueChange={(v) => setPaymentForm({ ...paymentForm, subscriptionMonths: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">شهر واحد</SelectItem>
                    <SelectItem value="3">3 أشهر</SelectItem>
                    <SelectItem value="6">6 أشهر</SelectItem>
                    <SelectItem value="12">سنة كاملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  placeholder="أضف أي ملاحظات إضافية..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleRecordPayment} className="gap-2">
                <Receipt className="h-4 w-4" />
                تسجيل الدفعة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Display Priority Dialog */}
        <Dialog open={isPriorityDialogOpen} onOpenChange={setIsPriorityDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                إدارة أولوية الظهور
              </DialogTitle>
              <DialogDescription>
                تحديد ترتيب ظهور المركز في صفحة البحث: <strong>{selectedCenter?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>رقم الأولوية</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="اترك فارغاً لإلغاء الأولوية"
                  value={priorityForm.priority ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPriorityForm({
                      priority: value === "" ? null : parseInt(value),
                    });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  • أصغر رقم = أعلى أولوية (يظهر أولاً)
                  <br />
                  • المراكز بدون أولوية تظهر بعد المراكز ذات الأولوية
                  <br />
                  • لا يمكن تكرار نفس الرقم
                </p>
              </div>

              {priorityForm.priority !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-900">
                    ✨ سيظهر هذا المركز في المركز رقم <strong>{priorityForm.priority}</strong> في نتائج البحث
                  </p>
                </div>
              )}

              {priorityForm.priority === null && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="text-amber-900">
                    ⚠️ سيتم إلغاء الأولوية - سيظهر المركز بعد المراكز ذات الأولوية
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPriorityDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdatePriority} className="gap-2">
                <Sliders className="h-4 w-4" />
                حفظ الأولوية
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}
