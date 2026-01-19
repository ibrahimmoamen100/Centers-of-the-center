import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Eye, Edit, Archive, Trash2, RotateCcw, CheckCircle, Sliders, CreditCard, MapPin } from "lucide-react";
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
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface matching Firestore Schema
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

  // Renew / Approve Form State
  const [renewForm, setRenewForm] = useState({ durationMonths: 1, amount: 300, paymentType: "cash" });

  // Limit Form State
  const [limitForm, setLimitForm] = useState({ newLimit: 10, extraCost: 0 });

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

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المركز</DialogTitle>
              <DialogDescription>عرض جميع بيانات المركز المسجلة.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">
              {selectedCenter && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted border flex items-center justify-center overflow-hidden">
                        {selectedCenter.logo ? (
                          <img src={selectedCenter.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : <Eye className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{selectedCenter.name}</h3>
                        <Badge variant="outline" className="mt-1">{selectedCenter.status}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2"><span className="font-semibold w-24">المحافظة:</span> <span>{selectedCenter.governorate || '-'}</span></div>
                      <div className="flex gap-2"><span className="font-semibold w-24">المنطقة:</span> <span>{selectedCenter.area || '-'}</span></div>
                      <div className="flex gap-2"><span className="font-semibold w-24">العنوان:</span> <span>{selectedCenter.address || '-'}</span></div>
                      <div className="flex gap-2"><span className="font-semibold w-24">الهاتف:</span> <span>{selectedCenter.phone || '-'}</span></div>
                      <div className="flex gap-2"><span className="font-semibold w-24">مواعيد العمل:</span> <span>{selectedCenter.workingHours || '-'}</span></div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold border-b pb-2">البيانات الأكاديمية</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold block mb-1">المراحل الدراسية:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedCenter.stages?.map(s => <Badge key={s} variant="secondary">{s}</Badge>) || <span className="text-muted-foreground">-</span>}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">الصفوف الدراسية:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedCenter.grades?.map(g => <Badge key={g} variant="outline">{g}</Badge>) || <span className="text-muted-foreground">-</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  <div className="md:col-span-2 bg-muted/40 p-4 rounded-lg">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> تفاصيل الاشتراك</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">حالة الاشتراك</span>
                        <span className="font-medium">{selectedCenter.subscription?.status || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">يبدأ في</span>
                        <span className="font-medium">{formatDate(selectedCenter.subscription?.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">ينتهي في</span>
                        <span className="font-medium">{formatDate(selectedCenter.subscription?.endDate)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">الاستهلاك</span>
                        <span className="font-medium">{selectedCenter.operationsUsed} / {selectedCenter.operationsLimit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>إغلاق</Button>
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

      </div>
    </div>
  );
}
