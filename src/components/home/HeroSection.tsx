import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-background blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-background blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">


          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-slide-up">
            ابحث عن أفضل
            <br />
            <span className="relative">
              المراكز التعليمية
              <svg className="absolute -bottom-2 left-0 right-0 h-3 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 2 150 2 198 10" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-slide-up stagger-1">
            منصة شاملة تساعدك في العثور على المراكز التعليمية، معرفة جداول الحصص، والتواصل مع أفضل المدرسين
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="animate-slide-up stagger-2">
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث باسم المركز، المدرس، أو المادة..."
                  className="h-14 pr-12 text-base bg-background border-0 shadow-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="hero" size="xl" className="shadow-xl">
                ابحث الآن
              </Button>
            </div>
          </form>


        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
