import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import CenterCard from "@/components/centers/CenterCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCentersWithPagination } from "@/hooks/useCentersWithPagination";
import { useCentersStore } from "@/stores/centersStore";
import { SEO } from "@/components/common/SEO";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const { setFilters } = useCentersStore();

  // Use new hook with pagination
  const { centers, loading, error, hasMore, loadMore, currentPage } = useCentersWithPagination();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update filters with search query
    setFilters({ searchQuery: searchQuery.trim() });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({
      governorate: newFilters.governorate,
      area: newFilters.area,
      stage: newFilters.stage,
      grade: newFilters.grade,
      subjects: newFilters.subjects,
      searchQuery: searchQuery.trim(),
    });
  };

  // Client-side filter for search query (in addition to server-side searchKeywords)
  const filteredCenters = searchQuery
    ? centers.filter((center) => {
      const query = searchQuery.toLowerCase();
      return (
        center.name.toLowerCase().includes(query) ||
        center.subjects?.some((subject) => subject.toLowerCase().includes(query)) ||
        center.location?.toLowerCase().includes(query) ||
        center.governorate?.toLowerCase().includes(query) ||
        center.area?.toLowerCase().includes(query) ||
        center.searchKeywords?.some((keyword) => keyword.includes(query))
      );
    })
    : centers;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={searchQuery ? `نتائج البحث عن "${searchQuery}"` : "بحث عن المراكز"}
        description="ابحث عن أفضل المراكز التعليمية في منطقتك. تصفح حسب المادة، المرحلة، أو المنطقة."
      />
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
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Loading State */}
          {loading && centers.length === 0 && (
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
                  {currentPage > 1 && <span className="text-sm mr-2">(الصفحة {currentPage})</span>}
                </p>
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

              {/* Pagination */}
              {filteredCenters.length > 0 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  {hasMore && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري التحميل...
                        </>
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4 ml-2" />
                          تحميل المزيد (9 مراكز)
                        </>
                      )}
                    </Button>
                  )}

                  <p className="text-sm text-muted-foreground">
                    عرض {filteredCenters.length} مركز
                    {!hasMore && <span className="mr-1">• تم عرض جميع النتائج</span>}
                  </p>
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
