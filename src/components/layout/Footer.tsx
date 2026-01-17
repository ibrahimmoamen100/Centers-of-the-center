import { Link } from "react-router-dom";
import { GraduationCap, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">دليل المراكز</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              منصتك الشاملة للبحث عن أفضل المراكز التعليمية في منطقتك. نساعدك في العثور على المدرسين المناسبين وجداول الحصص.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">روابط سريعة</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-background/70 hover:text-background transition-colors text-sm">
                الرئيسية
              </Link>
              <Link to="/search" className="text-background/70 hover:text-background transition-colors text-sm">
                البحث عن مركز
              </Link>
              <Link to="/register" className="text-background/70 hover:text-background transition-colors text-sm">
                سجل مركزك
              </Link>
              <Link to="/about" className="text-background/70 hover:text-background transition-colors text-sm">
                عن المنصة
              </Link>
            </nav>
          </div>

          {/* Stages */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">المراحل الدراسية</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/search?stage=prep" className="text-background/70 hover:text-background transition-colors text-sm">
                المرحلة الإعدادية
              </Link>
              <Link to="/search?stage=secondary" className="text-background/70 hover:text-background transition-colors text-sm">
                المرحلة الثانوية
              </Link>
              <Link to="/search?stage=primary" className="text-background/70 hover:text-background transition-colors text-sm">
                المرحلة الابتدائية
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">تواصل معنا</h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@dalil.com" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm">
                <Mail className="h-4 w-4" />
                info@dalil.com
              </a>
              <a href="tel:+201234567890" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm">
                <Phone className="h-4 w-4" />
                +20 123 456 7890
              </a>
              <div className="flex items-center gap-2 text-background/70 text-sm">
                <MapPin className="h-4 w-4" />
                القاهرة، مصر
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-background/50 text-sm">
          <p>© 2024 دليل المراكز التعليمية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
