import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import CenterCard from "@/components/centers/CenterCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCenters } from "@/hooks/useCenters";

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

  // Fetch centers with applied filters
  const { centers, loading, error } = useCenters({
    governorate: filters.governorate,
    area: filters.area,
    stage: filters.stage,
    subjects: filters.subjects,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic would go here
    // You could filter centers based on searchQuery
  };

  // Filter centers based on search query
  const filteredCenters = searchQuery
    ? centers.filter(
      (center) =>
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.subjects.some((subject) =>
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        center.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : centers;

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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-3 text-muted-foreground">جاري البحث...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive">حدث خطأ أثناء البحث: {error}</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  تم العثور على <span className="font-bold text-foreground">{filteredCenters.length}</span> مركز
                </p>
                <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm">
                  <option>الأعلى تقييماً</option>
                  <option>الأقرب إليك</option>
                  <option>الأحدث</option>
                </select>
              </div>

              {/* Empty State */}
              {filteredCenters.length === 0 && (
                <div className="bg-muted/50 rounded-lg p-12 text-center">
                  <p className="text-muted-foreground text-lg">لم يتم العثور على مراكز مطابقة لبحثك</p>
                  <p className="text-muted-foreground mt-2">جرب تعديل معايير البحث أو الفلاتر</p>
                </div>
              )}

              {/* Centers Grid */}
              {filteredCenters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCenters.map((center, index) => (
                    <div key={center.id} className={`animate-slide-up stagger-${(index % 3) + 1}`}>
                      <CenterCard center={center} />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination placeholder - can be enhanced later */}
              {filteredCenters.length > 0 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" disabled>
                      السابق
                    </Button>
                    <Button variant="default">1</Button>
                    <Button variant="outline" disabled>
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
