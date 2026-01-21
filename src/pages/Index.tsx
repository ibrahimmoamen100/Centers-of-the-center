import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StagesSection from "@/components/home/StagesSection";
import FeaturedCentersSection from "@/components/home/FeaturedCentersSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";
import { SEO } from "@/components/common/SEO";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="الرئيسية"
        description="دليل المراكز التعليمية في مصر – اكتشف أفضل المراكز التعليمية، تصفح جداول الحصص، وتعرف على نخبة المدرسين في جميع المراحل التعليمية."
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StagesSection />
        <FeaturedCentersSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
