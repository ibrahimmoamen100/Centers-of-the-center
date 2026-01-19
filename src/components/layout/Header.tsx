import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md group-hover:shadow-glow transition-shadow duration-300">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">دليل المراكز</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            الرئيسية
          </Link>
          <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            البحث
          </Link>
          <Link to="/centers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            المراكز
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/center/login">تسجيل الدخول</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/center/register">سجل مركزك</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <nav className="container py-4 flex flex-col gap-2">
            <Link
              to="/"
              className="px-4 py-3 rounded-lg hover:bg-accent transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link
              to="/search"
              className="px-4 py-3 rounded-lg hover:bg-accent transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              البحث
            </Link>
            <Link
              to="/centers"
              className="px-4 py-3 rounded-lg hover:bg-accent transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              المراكز
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/center/login" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
              </Button>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/center/register" onClick={() => setIsMenuOpen(false)}>سجل مركزك</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
