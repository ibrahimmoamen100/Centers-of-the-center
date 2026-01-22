import { Check, QrCode, TrendingUp, Share2, Calendar, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEO } from "@/components/common/SEO";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: "الباقة الأساسية",
            price: 350,
            operations: 20,
            description: "مثالية للمراكز الصغيرة والمتوسطة",
            popular: false,
            features: [
                "ظهور المركز في نتائج البحث",
                "صفحة عرض احترافية للمركز",
                "إضافة المدرسين والحصص",
                "جدول حصص تفاعلي",
                "20 عملية تعديل شهرياً",
                "QR Code لجدول الحصص",
                "الدعم الفني المباشر",
                "تحديثات مجانية"
            ]
        },
        {
            name: "الباقة المتقدمة",
            price: 500,
            operations: 50,
            description: "الأفضل للمراكز الكبيرة والنشطة",
            popular: true,
            features: [
                "جميع مميزات الباقة الأساسية",
                "50 عملية تعديل شهرياً",
                "أولوية في نتائج البحث",
                "تحليلات متقدمة للزيارات",
                "دعم فني مميز 24/7",
                "QR Codes متعددة لكل صف",
                "تخصيص كامل للصفحة",
                "شارة 'مركز موثوق'"
            ]
        }
    ];

    const mainFeatures = [
        {
            icon: QrCode,
            title: "QR Code لجدول الحصص",
            description: "ميزة فريدة من نوعها! أنشئ QR Code مخصص لجدول حصص كل صف دراسي. يمكن للطلاب مسحه بهواتفهم والوصول الفوري لجدول الحصص المحدث.",
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            icon: TrendingUp,
            title: "ظهور في محركات البحث",
            description: "مركزك سيظهر في Google وSEO محسّن بالكامل. زيادة الوصول للطلاب وأولياء الأمور بشكل طبيعي.",
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            icon: Share2,
            title: "الدخول للعالم الرقمي",
            description: "تحويل مركزك من الطرق التقليدية إلى منصة رقمية احترافية. مشاركة سهلة على WhatsApp ووسائل التواصل الاجتماعي.",
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        },
        {
            icon: Calendar,
            title: "جداول حصص ديناميكية",
            description: "إنشاء وتحديث جداول الحصص بسهولة. يمكن تخصيص جدول لكل صف دراسي مع عرض احترافي وجذاب.",
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO
                title="الأسعار والباقات"
                description="اختر الباقة المناسبة لمركزك التعليمي. أسعار شفافة ومميزات قوية تشمل QR Code للجداول، ظهور في محركات البحث، والمزيد."
            />
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 lg:py-28">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
                        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-secondary blur-3xl" />
                    </div>

                    <div className="container relative">
                        <div className="mx-auto max-w-3xl text-center">
                            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
                                <Star className="h-4 w-4 mr-2 inline-block fill-current" />
                                أسعار شفافة وواضحة
                            </Badge>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-6">
                                اختر الباقة المناسبة
                                <br />
                                <span className="text-gradient bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                                    لمركزك التعليمي
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground mb-8">
                                باقات مرنة بأسعار تنافسية، شاملة جميع المميزات التي تحتاجها لنقل مركزك إلى العالم الرقمي
                            </p>
                        </div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="py-20 relative -mt-16">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {plans.map((plan, index) => (
                                <Card
                                    key={index}
                                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-2 text-sm font-bold">
                                            <Zap className="h-4 w-4 inline-block mr-1 fill-current" />
                                            الأكثر طلباً
                                        </div>
                                    )}

                                    <CardHeader className={plan.popular ? "pt-12" : ""}>
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription className="text-base">{plan.description}</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold text-primary">{plan.price}</span>
                                            <span className="text-2xl text-muted-foreground">ج.م</span>
                                            <span className="text-muted-foreground">/ شهر</span>
                                        </div>

                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">عمليات التعديل الشهرية</span>
                                                <span className="text-2xl font-bold text-primary">{plan.operations}</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' : ''}`}
                                            size="lg"
                                            onClick={() => navigate('/center/register')}
                                        >
                                            ابدأ الآن
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* QR Code Feature Highlight */}
                <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
                    <div className="container">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="order-2 lg:order-1">
                                    <Badge className="mb-4 bg-blue-600 text-white border-0 px-4 py-2">
                                        <Star className="h-4 w-4 mr-2 inline-block fill-current" />
                                        الميزة الأقوى
                                    </Badge>
                                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-primary">
                                        QR Code لجدول الحصص
                                        <br />
                                        <span className="text-2xl text-muted-foreground font-medium">ميزة فريدة من نوعها</span>
                                    </h2>
                                    <div className="space-y-4 text-lg text-muted-foreground mb-8">
                                        <p className="leading-relaxed">
                                            🎯 <strong className="text-foreground">أنشئ QR Code مخصص</strong> لجدول حصص كل صف دراسي في مركزك
                                        </p>
                                        <p className="leading-relaxed">
                                            📱 <strong className="text-foreground">الطلاب يمسحون الكود</strong> بهواتفهم ويصلون فوراً لجدول الحصص المحدث
                                        </p>
                                        <p className="leading-relaxed">
                                            ⚡ <strong className="text-foreground">تحديثات فورية</strong> - أي تعديل في الجدول يظهر مباشرة للطلاب
                                        </p>
                                        <p className="leading-relaxed">
                                            ✨ <strong className="text-foreground">احترافية عالية</strong> - طريقة عصرية لتنظيم الحصص وتوصيل المعلومات
                                        </p>
                                    </div>
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/center/register')}>
                                        <QrCode className="h-5 w-5 mr-2" />
                                        جرّب الميزة الآن
                                    </Button>
                                </div>

                                <div className="order-1 lg:order-2 flex justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                                        <img
                                            src="/qr_scan_phone_1769100037950.png"
                                            alt="QR Code Scanning"
                                            className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Features Grid */}
                <section className="py-20">
                    <div className="container">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-primary">
                                مميزات تجعل مركزك متميزاً
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                أدوات قوية ومميزات حصرية لنقل مركزك التعليمي إلى المستوى التالي
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {mainFeatures.map((feature, index) => (
                                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                                    <CardHeader>
                                        <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                                            <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-primary to-secondary">
                    <div className="container">
                        <div className="max-w-3xl mx-auto text-center text-white">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                                جاهز لنقل مركزك إلى العالم الرقمي؟
                            </h2>
                            <p className="text-lg mb-8 text-white/90">
                                انضم إلى مئات المراكز التعليمية التي تثق بنا. ابدأ اليوم واحصل على جميع المميزات فوراً
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="shadow-xl text-lg"
                                    onClick={() => navigate('/center/register')}
                                >
                                    سجل مركزك الآن
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-white text-white hover:bg-white hover:text-primary shadow-xl text-lg"
                                    onClick={() => navigate('/search')}
                                >
                                    تصفح المراكز
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Pricing;
