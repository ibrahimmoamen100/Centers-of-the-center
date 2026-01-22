# 🚀 دليل سريع - استخدام React Query Hooks

## 📌 للبحث عن المراكز

```tsx
import { useCentersQuery } from '@/hooks/useCentersQuery';
import { useCentersStore } from '@/stores/centersStore';

function SearchPage() {
  // 1. إدارة الفلاتر عبر Zustand
  const { filters, setFilters } = useCentersStore();
  
  // 2. جلب البيانات عبر React Query
  const { 
    centers,        // المراكز المحملة
    loading,        // حالة التحميل
    error,          // الخطأ إن وجد
    hasMore,        // هل يوجد صفحات إضافية؟
    currentPage,    // الصفحة الحالية
    nextPage,       // الانتقال للصفحة التالية
    previousPage,   // الرجوع للصفحة السابقة
    resetPagination // إعادة تعيين الترقيم
  } = useCentersQuery();
  
  // 3. تحديث الفلاتر
  const handleFilterChange = (newFilters) => {
    setFilters({
      governorate: newFilters.governorate,
      area: newFilters.area,
      stage: newFilters.stage,
      // ...
    });
  };
  
  return (
    <div>
      {loading && <Spinner />}
      {centers.map(center => <CenterCard key={center.id} center={center} />)}
      
      <Button onClick={previousPage} disabled={currentPage === 1}>
        السابق
      </Button>
      
      <Button onClick={nextPage} disabled={!hasMore}>
        التالي
      </Button>
    </div>
  );
}
```

---

## 📌 لعرض تفاصيل مركز

```tsx
import { useCenterDetailsQuery } from '@/hooks/useCenterDetailsQuery';

function CenterPage() {
  const { id } = useParams();
  
  const { 
    center,    // بيانات المركز
    teachers,  // قائمة المدرسين
    sessions,  // قائمة الحصص
    loading,   // حالة التحميل
    error,     // الخطأ إن وجد
    refetch    // إعادة الجلب يدوياً (نادراً ما تحتاجه)
  } = useCenterDetailsQuery(id);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  if (!center) return <NotFound />;
  
  return (
    <div>
      <h1>{center.name}</h1>
      <TeachersList teachers={teachers} />
      <SessionsTimetable sessions={sessions} />
    </div>
  );
}
```

---

## 📌 متى يتم جلب البيانات من Firebase؟

### ✅ جلب جديد (Firebase Read):
- أول زيارة للصفحة
- تغيير الفلاتر إلى قيم جديدة
- مرور أكثر من 5 دقائق على آخر جلب

### ⚡ من الـ Cache (بدون Firebase Read):
- الرجوع للصفحة خلال 5 دقائق
- تغيير الفلاتر إلى قيم سبق جلبها
- التنقل بين التبويبات في نفس الصفحة

---

## 📌 إعادة تحميل البيانات يدوياً

```tsx
const { refetch } = useCentersQuery();

// استخدم refetch فقط عند الحاجة (مثلاً بعد تعديل بيانات)
const handleUpdate = async () => {
  await updateCenterData();
  refetch(); // إعادة جلب البيانات
};
```

---

## 📌 إبطال الـ Cache (Invalidate)

```tsx
import { useQueryClient } from '@tanstack/react-query';

function UpdateCenterForm() {
  const queryClient = useQueryClient();
  
  const handleSave = async () => {
    await updateCenter(data);
    
    // إبطال cache هذا المركز (سيتم إعادة جلبه عند الطلب)
    queryClient.invalidateQueries(['center-details', centerId]);
    
    // أو إبطال جميع المراكز
    queryClient.invalidateQueries(['centers']);
  };
}
```

---

## 🎯 أهم النقاط

1. **Zustand** = فلاتر وحالة UI فقط
2. **React Query** = جلب البيانات والكاشينج
3. **staleTime = 5 دقائق** = متى تعتبر البيانات قديمة؟
4. **gcTime = 10 دقائق** = متى يتم حذف البيانات من الذاكرة؟
5. استخدم `refetch()` فقط عند الضرورة
6. استخدم `invalidateQueries()` بعد التعديلات

---

## ⚙️ تخصيص الإعدادات

إذا أردت تغيير إعدادات معينة لـ hook محدد:

```tsx
const { data } = useQuery({
  queryKey: ['custom'],
  queryFn: fetchData,
  staleTime: 10 * 60 * 1000, // 10 دقائق بدلاً من 5
  gcTime: 20 * 60 * 1000,    // 20 دقيقة بدلاً من 10
  refetchOnWindowFocus: true  // تفعيل الـ refetch عند التركيز
});
```

---

✅ تم!
