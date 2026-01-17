import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import CenterCard from "@/components/centers/CenterCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock data
const mockCenters = [
  {
    id: "1",
    name: "مركز النور التعليمي",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    location: "المعادي، القاهرة",
    stage: "ثانوي",
    subjects: ["رياضيات", "فيزياء", "كيمياء"],
    rating: 4.8,
    reviewCount: 124,
    teacherCount: 15,
  },
  {
    id: "2",
    name: "أكاديمية التفوق",
    logo: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=100&h=100&fit=crop",
    location: "مدينة نصر، القاهرة",
    stage: "إعدادي - ثانوي",
    subjects: ["لغة عربية", "لغة إنجليزية", "علوم"],
    rating: 4.6,
    reviewCount: 89,
    teacherCount: 12,
  },
  {
    id: "3",
    name: "مركز العلم والمعرفة",
    logo: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=100&h=100&fit=crop",
    location: "الهرم، الجيزة",
    stage: "ابتدائي - إعدادي",
    subjects: ["رياضيات", "لغة عربية", "دراسات"],
    rating: 4.9,
    reviewCount: 156,
    teacherCount: 18,
  },
  {
    id: "4",
    name: "مركز الأمل التعليمي",
    logo: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100&h=100&fit=crop",
    location: "الدقي، الجيزة",
    stage: "ثانوي",
    subjects: ["فيزياء", "أحياء", "كيمياء"],
    rating: 4.7,
    reviewCount: 98,
    teacherCount: 10,
  },
  {
    id: "5",
    name: "أكاديمية المستقبل",
    logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop",
    location: "حلوان، القاهرة",
    stage: "إعدادي",
    subjects: ["رياضيات", "علوم", "لغة إنجليزية"],
    rating: 4.5,
    reviewCount: 72,
    teacherCount: 8,
  },
  {
    id: "6",
    name: "مركز العباقرة",
    logo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&h=100&fit=crop",
    location: "المنيل، القاهرة",
    stage: "ثانوي",
    subjects: ["رياضيات", "فيزياء", "لغة عربية", "تاريخ"],
    rating: 4.9,
    reviewCount: 203,
    teacherCount: 22,
  },
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    governorate: "",
    area: "",
    stage: "",
    grade: "",
    subjects: [] as string[],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic would go here
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              البحث عن مراكز تعليمية
            </h1>
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="ابحث باسم المركز، المدرس، أو المادة..."
                    className="h-12 pr-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12">
                  بحث
                </Button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <SearchFilters onFilterChange={setFilters} />
          </div>

          {/* Results */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              تم العثور على <span className="font-bold text-foreground">{mockCenters.length}</span> مركز
            </p>
            <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm">
              <option>الأعلى تقييماً</option>
              <option>الأقرب إليك</option>
              <option>الأحدث</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCenters.map((center, index) => (
              <div key={center.id} className={`animate-slide-up stagger-${(index % 3) + 1}`}>
                <CenterCard center={center} />
              </div>
            ))}
          </div>

          {/* Pagination placeholder */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled>
                السابق
              </Button>
              <Button variant="default">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">التالي</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
