# 📋 دليل التحسينات المطلوبة - Center Dashboard

## ✅ **ما تم إنجازه**

### 1. نظام تنسيق التاريخ العربي
- ✅ ملف `src/lib/dateUtils.ts` تم إنشاؤه
- ✅ دوال كاملة لتنسيق التواريخ بالعربية
- ✅ دعم نظام 12 ساعة (صباحاً/مساءً)

### 2. تحسين CenterOverview  
- ✅ عرض اللوجو (إذا موجود فقط)
- ✅ تنسيق تواريخ الاشتراك بالصيغة العربية
- ✅ تحسين واجهة قسم الاشتراك

## 🔧 **التحديثات المطلوبة - TeachersManagement**

### المشاكل الحالية:
1. ❌ قائمة المواد ثابتة (hardcoded)
2. ❌ لا يوجد حقل للصورة الشخصية
3. ❌ لا يوجد حقل للنبذة عن المدرس

### الحل:

#### أ) تحديث Teacher Interface
```typescript
interface Teacher {
  id: string;
  name: string;
  subject: string;
  image?: string;  // URL للصورة
  bio?: string;     // نبذة عن المدرس - NEW
  phone: string;
}
```

#### ب) جلب المواد ديناميكياً من المركز
```typescript
const [centerSubjects, setCenterSubjects] = useState<string[]>([]);

useEffect(() => {
  const fetchCenterData = async () => {
    const centerDoc = await getDoc(doc(db, "centers", centerId));
    if (centerDoc.exists()) {
      const data = centerDoc.data();
      // افتراض أن المركز لديه حقل subjects
      setCenterSubjects(data.subjects || []);
    }
  };
  fetchCenterData();
}, [centerId]);
```

#### ج) إضافة حقول جديدة في Form
```tsx
{/* صورة المدرس */}
<div className="space-y-2">
  <Label>صورة المدرس (اختياري)</Label>
  <Input 
    type="file" 
    accept="image/*"
    onChange={handleImageUpload}
  />
</div>

{/* نبذة عن المدرس */}
<div className="space-y-2">
  <Label>نبذة عن المدرس</Label>
  <Textarea
    placeholder="نبذة مختصرة عن المدرس وخبراته..."
    value={newTeacher.bio}
    onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })}
    rows={3}
  />
</div>
```

## 🔧 **التحديثات المطلوبة - SessionsManagement**

### المشاكل الحالية:
1. ❌ عرض مدرسين وهميين/ثابتين
2. ❌ اختيار المادة يدوياً (يجب أن يكون تلقائياً)
3. ❌ لا يوجد  دعم للحصص المستمرة vs الفردية
4. ❌ التواريخ بصيغة غير واضحة

### الحل:

#### أ) Session Interface المحدث
```typescript
interface Session {
  id: string;
  teacherId: string;        // مرتبط بالمدرس
  teacherName: string;      // للعرض
  subject: string;          // يُجلب تلقائياً من المدرس
  grade: string;
  type: 'recurring' | 'single';  // NEW
  startDateTime: string;
  endDateTime?: string;     // للحصص المستمرة فقط
  days?: string[];          // أيام الأسبوع للحصص المستمرة
  sessionTime: string;      // وقت الحصة (مثلاً "2:00 PM")
}
```

#### ب) جلب المدرسين الحقيقيين
```typescript
const [teachers, setTeachers] = useState<Teacher[]>([]);

useEffect(() => {
  const fetchTeachers = async () => {
    const q = query(collection(db, "centers", centerId, "teachers"));
    const snapshot = await getDocs(q);
    setTeachers(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Teacher)));
  };
  fetchTeachers();
}, [centerId]);
```

#### ج) اختيار المدرس (المادة تلقائياً)
```tsx
<Select
  value={newSession.teacherId}
  onValueChange={(teacherId) => {
    const selectedTeacher = teachers.find(t => t.id === teacherId);
    setNewSession({
      ...newSession,
      teacherId,
      teacherName: selectedTeacher?.name || '',
      subject: selectedTeacher?.subject || ''  // تلقائي!
    });
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="اختر المدرس" />
  </SelectTrigger>
  <SelectContent>
    {teachers.map((teacher) => (
      <SelectItem key={teacher.id} value={teacher.id}>
        {teacher.name} - {teacher.subject}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

#### د) نوع الحصة
```tsx
<Select
  value={newSession.type}
  onValueChange={(type: 'recurring' | 'single') => 
    setNewSession({ ...newSession, type })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="نوع الحصة" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="single">حصة فردية</SelectItem>
    <SelectItem value="recurring">حصة مستمرة</SelectItem>
  </SelectContent>
</Select>

{/* حقول إضافية للحصص المستمرة */}
{newSession.type === 'recurring' && (
  <>
    <div className="space-y-2">
      <Label>تاريخ النهاية</Label>
      <Input
        type="datetime-local"
        value={newSession.endDateTime}
        onChange={(e) => setNewSession({ ...newSession, endDateTime: e.target.value })}
      />
    </div>
  </>
)}
```

#### هـ) جلب الصفوف من المركز
```typescript
const [centerGrades, setCenterGrades] = useState<string[]>([]);

useEffect(() => {
  const fetchCenterData = async () => {
    const centerDoc = await getDoc(doc(db, "centers", centerId));
    if (centerDoc.exists()) {
      const data = centerDoc.data();
      setCenterGrades(data.grades || []);
    }
  };
  fetchCenterData();
}, [centerId]);
```

## 📅 **Calendar Component - الجدول الزمني المحسّن**

### المتطلبات:
- ✅ عرض شهري/أسبوعي/يومي
- ✅ أسماء الأيام بالعربية
- ✅ الأوقات بنظام 12 ساعة
- ✅ عرض الحصص الفعلية

### الخطة:
سيتم إنشاء `src/components/center/Calendar.tsx` مع:
- استخدام مكتبة Calendar جاهزة (مثل `react-big-calendar`)
- تخصيصها بالكامل للعربية
- ربطها بالحصص الحقيقية من Firebase

## 🎯 **خطة التنفيذ التالية**

### المرحلة 1: TeachersManagement (الأولوية)
1. ✅ تحديث Interface
2. ⏳ إضافة رفع الصور
3. ⏳ إضافة حقل النبذة
4. ⏳ جلب المواد ديناميكياً

### المرحلة 2: SessionsManagement
1. ⏳ ربط المدرسين الحقيقيين
2. ⏳ اختيار المادة تلقائياً
3. ⏳ دعم الحصص المستمرة/الفردية
4. ⏳ تنسيق عرض التواريخ

### المرحلة 3: Calendar Component
1. ⏳ إنشاء Component أساسي
2. ⏳ تخصيص اللغة والوقت
3. ⏳ ربط البيانات الحقيقية

## 📝 ملاحظات هامة

### Firebase Storage للصور:
```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const handleImageUpload = async (file: File) => {
  const storageRef = ref(storage, `teachers/${centerId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};
```

### Firestore Schema للمركز:
```json
{
  "centers": {
    "centerID": {
      "subjects": ["الرياضيات", "الفيزياء"],
      "grades": ["الصف الأول الثانوي", "الصف الثاني الثانوي"]
    }
  }
}
```
