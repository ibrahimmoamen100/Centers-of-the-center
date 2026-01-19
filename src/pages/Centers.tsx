import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CenterCard from "@/components/centers/CenterCard";
import { useCenters } from "@/hooks/useCenters";
import { Loader2 } from "lucide-react";

const Centers = () => {
    const { centers, loading, error } = useCenters();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12">
                <div className="container">
                    {/* Page Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            جميع المراكز التعليمية
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            تصفح أفضل المراكز التعليمية المعتمدة
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="mr-3 text-muted-foreground">جاري تحميل المراكز...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                            <p className="text-destructive">حدث خطأ أثناء تحميل المراكز: {error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && centers.length === 0 && (
                        <div className="bg-muted/50 rounded-lg p-12 text-center">
                            <p className="text-muted-foreground text-lg">لا توجد مراكز متاحة حالياً</p>
                            <p className="text-muted-foreground mt-2">قم بالتسجيل لإضافة مركزك</p>
                        </div>
                    )}

                    {/* Centers Grid */}
                    {!loading && !error && centers.length > 0 && (
                        <>
                            <div className="mb-6">
                                <p className="text-muted-foreground">
                                    تم العثور على <span className="font-bold text-foreground">{centers.length}</span> مركز
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {centers.map((center, index) => (
                                    <div key={center.id} className={`animate-slide-up stagger-${(index % 3) + 1}`}>
                                        <CenterCard center={center} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Centers;
