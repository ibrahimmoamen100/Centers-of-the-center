import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO = ({
    title,
    description = "دليل المراكز التعليمية في مصر – اعرف جداول الحصص، المدرسين، المواد الدراسية وأماكن المراكز بسهولة للمرحلة الإعدادية والثانوية.",
    keywords = "مراكز تعليمية, ثانوية عامة, دروس خصوصية, جدول حصص, مدرسين, مصر, تعليم",
    image = "/og-image.jpg",
    url,
    type = "website"
}: SEOProps) => {
    const siteTitle = "CentersGuide";
    const fullTitle = `${title} | ${siteTitle}`;
    const currentUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Canonical URL */}
            <link rel="canonical" href={currentUrl} />
        </Helmet>
    );
};
