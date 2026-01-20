/**
 * Script لتحديث المراكز الموجودة في Firebase
 * يضيف searchKeywords لكل مركز للبحث السريع
 * 
 * ⚠️ تشغيل هذا Script مرة واحدة فقط!
 * 
 * Usage:
 * 1. إنشاء صفحة admin خاصة
 * 2. استدعاء هذه الـ function من زر
 * 3. مراقبة Console للتأكد من النجاح
 */

import {
    collection,
    getDocs,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UpdateProgress {
    total: number;
    updated: number;
    failed: number;
    errors: string[];
}

/**
 * تحديث جميع المراكز بإضافة searchKeywords
 */
export async function addSearchKeywordsToCenters(): Promise<UpdateProgress> {
    const progress: UpdateProgress = {
        total: 0,
        updated: 0,
        failed: 0,
        errors: [],
    };

    try {
        console.log('🚀 Starting searchKeywords update...');

        // 1. جلب جميع المراكز
        const centersRef = collection(db, 'centers');
        const centersSnapshot = await getDocs(centersRef);

        progress.total = centersSnapshot.size;
        console.log(`📊 Found ${progress.total} centers`);

        // 2. معالجة كل مركز
        for (const centerDoc of centersSnapshot.docs) {
            try {
                const centerId = centerDoc.id;
                const centerData = centerDoc.data();

                console.log(`\n📝 Processing: ${centerData.name} (${centerId})`);

                // 3. جلب المدرسين من Subcollection
                const teachersRef = collection(db, 'centers', centerId, 'teachers');
                const teachersSnapshot = await getDocs(teachersRef);
                const teacherNames = teachersSnapshot.docs
                    .map(doc => doc.data().name)
                    .filter(Boolean);

                console.log(`   👨‍🏫 Found ${teacherNames.length} teachers`);

                // 4. بناء Keywords
                const keywords = new Set<string>();

                // اسم المركز (تقسيمه لكلمات)
                if (centerData.name) {
                    const nameParts = centerData.name.toLowerCase().split(' ');
                    nameParts.forEach(part => {
                        if (part.length > 2) keywords.add(part);
                    });
                    keywords.add(centerData.name.toLowerCase());
                }

                // المحافظة
                if (centerData.governorate) {
                    keywords.add(centerData.governorate.toLowerCase());
                }

                // المنطقة
                if (centerData.area) {
                    keywords.add(centerData.area.toLowerCase());
                }

                // المواد
                if (centerData.subjects && Array.isArray(centerData.subjects)) {
                    centerData.subjects.forEach((subject: string) => {
                        keywords.add(subject.toLowerCase());
                    });
                }

                // المراحل
                if (centerData.stages && Array.isArray(centerData.stages)) {
                    centerData.stages.forEach((stage: string) => {
                        keywords.add(stage.toLowerCase());
                    });
                }

                // الصفوف
                if (centerData.grades && Array.isArray(centerData.grades)) {
                    centerData.grades.forEach((grade: string) => {
                        keywords.add(grade.toLowerCase());
                    });
                }

                // اسماء المدرسين
                teacherNames.forEach((name: string) => {
                    keywords.add(name.toLowerCase());
                    // تقسيم الاسم
                    const nameParts = name.toLowerCase().split(' ');
                    nameParts.forEach(part => {
                        if (part.length > 2) keywords.add(part);
                    });
                });

                const searchKeywordsArray = Array.from(keywords);

                console.log(`   🔍 Generated ${searchKeywordsArray.length} keywords`);

                // 5. تحديث المركز
                await updateDoc(doc(db, 'centers', centerId), {
                    searchKeywords: searchKeywordsArray,
                    updatedAt: new Date(),
                });

                progress.updated++;
                console.log(`   ✅ Updated successfully`);

            } catch (error: any) {
                progress.failed++;
                const errorMsg = `Failed to update ${centerDoc.id}: ${error.message}`;
                progress.errors.push(errorMsg);
                console.error(`   ❌ ${errorMsg}`);
            }
        }

        // 6. النتيجة النهائية
        console.log('\n' + '='.repeat(50));
        console.log('📊 Update Complete!');
        console.log('='.repeat(50));
        console.log(`✅ Successfully updated: ${progress.updated}/${progress.total}`);
        console.log(`❌ Failed: ${progress.failed}/${progress.total}`);

        if (progress.errors.length > 0) {
            console.log('\n❌ Errors:');
            progress.errors.forEach(error => console.log(`   - ${error}`));
        }

        return progress;

    } catch (error: any) {
        console.error('❌ Fatal error:', error);
        throw error;
    }
}

/**
 * تحديث مركز واحد فقط (للاختبار)
 */
export async function addSearchKeywordsToCenter(centerId: string): Promise<boolean> {
    try {
        console.log(`🔄 Updating center: ${centerId}`);

        const centerRef = doc(db, 'centers', centerId);
        const centerDoc = await getDocs(collection(db, 'centers'));
        const center = centerDoc.docs.find(d => d.id === centerId);

        if (!center) {
            throw new Error('Center not found');
        }

        const centerData = center.data();

        // جلب المدرسين
        const teachersRef = collection(db, 'centers', centerId, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        const teacherNames = teachersSnapshot.docs
            .map(doc => doc.data().name)
            .filter(Boolean);

        // بناء Keywords (نفس الكود أعلاه)
        const keywords = new Set<string>();

        if (centerData.name) keywords.add(centerData.name.toLowerCase());
        if (centerData.governorate) keywords.add(centerData.governorate.toLowerCase());
        if (centerData.area) keywords.add(centerData.area.toLowerCase());

        if (centerData.subjects) {
            centerData.subjects.forEach((s: string) => keywords.add(s.toLowerCase()));
        }

        teacherNames.forEach((name: string) => keywords.add(name.toLowerCase()));

        await updateDoc(centerRef, {
            searchKeywords: Array.from(keywords),
            updatedAt: new Date(),
        });

        console.log('✅ Center updated successfully');
        return true;

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

/**
 * عرض preview للـ keywords بدون تحديث
 */
export async function previewSearchKeywords(centerId: string): Promise<string[]> {
    try {
        const centerDoc = await getDocs(collection(db, 'centers'));
        const center = centerDoc.docs.find(d => d.id === centerId);

        if (!center) {
            throw new Error('Center not found');
        }

        const centerData = center.data();

        const teachersRef = collection(db, 'centers', centerId, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        const teacherNames = teachersSnapshot.docs
            .map(doc => doc.data().name)
            .filter(Boolean);

        const keywords = new Set<string>();

        if (centerData.name) keywords.add(centerData.name.toLowerCase());
        if (centerData.governorate) keywords.add(centerData.governorate.toLowerCase());
        if (centerData.area) keywords.add(centerData.area.toLowerCase());

        if (centerData.subjects) {
            centerData.subjects.forEach((s: string) => keywords.add(s.toLowerCase()));
        }

        teacherNames.forEach((name: string) => keywords.add(name.toLowerCase()));

        return Array.from(keywords);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        return [];
    }
}
