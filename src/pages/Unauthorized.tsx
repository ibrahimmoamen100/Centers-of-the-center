import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <SEO title="غير مصرح" />
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-200 rounded-full blur-2xl opacity-50"></div>
                        <div className="relative bg-white rounded-full p-6 shadow-xl">
                            <ShieldX className="w-16 h-16 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    غير مصرح لك بالدخول
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold"
                    >
                        <ArrowRight className="w-5 h-5" />
                        العودة للخلف
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                    >
                        <Home className="w-5 h-5" />
                        الصفحة الرئيسية
                    </button>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-sm text-gray-500">
                    إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول
                </p>
            </div>
        </div>
    );
}
