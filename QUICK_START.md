# ✅ الأوامر السريعة لتفعيل النظام

## 1️⃣ تفعيل Email/Password في Firebase (ضروري جداً!)

⚠️ **يجب القيام بهذه الخطوة أولاً لحل خطأ `auth/operation-not-allowed`**

**الخطوات:**
1. افتح https://console.firebase.google.com/
2. اختر مشروع: `center-of-the-centers`
3. Authentication → Sign-in method
4. فعّل **Email/Password**
5. احفظ التغييرات

## 2️⃣ نشر قواعد الأمان (Security Rules)

```bash
firebase deploy --only firestore:rules
```

## 3️⃣ إنشاء حساب Super Admin الأول

### الطريقة السهلة (من Firebase Console):

1. Authentication → Add user
2. Email: `admin@yourdomain.com`
3. Password: `YourStrongPassword123!`
4. انسخ الـ UID
5. Firestore Database → Start collection → `users`
6. Document ID: الصق الـ UID
7. أضف الحقول:

```
uid: <UID>
email: admin@yourdomain.com
role: super_admin
status: active
displayName: مسؤول النظام
createdAt: <server timestamp>
updatedAt: <server timestamp>
```

## 4️⃣ الوصول إلى النظام

### Super Admin:
- المسار: `/admin/login`
- البريد: `admin@yourdomain.com`
- كلمة المرور: `YourStrongPassword123!`

### Center Admin (التسجيل الذاتي):
- المسار: `/center/register`
- املأ النموذج وأنشئ حساباً جديداً

### Center Admin (عبر دعوة):
1. Super Admin يرسل دعوة من `/admin/dashboard`
2. المدعو يفتح رابط الدعوة
3. يُنشئ حساب أو يسجل دخول

## 5️⃣ اختبار النظام

```bash
# تشغيل المشروع
npm run dev
```

### اختبارات سريعة:

1. **تسجيل مركز:** `/center/register`
2. **دخول مسؤول:** `/admin/login`
3. **إرسال دعوة:** من لوحة المسؤول
4. **حماية المسارات:** حاول الدخول لـ `/admin/dashboard` بدون تسجيل

## 📋 ملخص الملفات الجديدة

### Types & Hooks
- ✅ `src/types/auth.ts`
- ✅ `src/hooks/useAuth.ts`
- ✅ `src/hooks/useUserRole.ts`

### Components
- ✅ `src/components/ProtectedRoute.tsx`
- ✅ `src/components/admin/InvitationsManagement.tsx`

### Pages
- ✅ `src/pages/AdminLogin.tsx`
- ✅ `src/pages/AcceptInvitation.tsx`
- ✅ `src/pages/Unauthorized.tsx`

### Configuration
- ✅ `firestore.rules`

### Updated
- ✅ `src/pages/CenterRegister.tsx`
- ✅ `src/App.tsx`

## 🔍 التحقق من نجاح التثبيت

### 1. تحقق من تفعيل Firebase Auth:
- افتح `/center/register`
- حاول التسجيل
- إذا نجح → ✅
- إذا ظهر خطأ `auth/operation-not-allowed` → ❌ (ارجع للخطوة 1)

### 2. تحقق من Super Admin:
- افتح `/admin/login`
- سجل دخول
- إذا وصلت لـ `/admin/dashboard` → ✅

### 3. تحقق من الحماية:
- افتح `/admin/dashboard` بدون تسجيل
- يجب إعادة التوجيه لـ `/admin/login` → ✅

## 🆘 مشاكل شائعة

### "Cannot find module..."
```bash
# تأكد من تثبيت الحزم
npm install
```

### "auth/operation-not-allowed"
- ارجع للخطوة 1 وفعّل Email/Password

### "غير مصرح لك"
- تأكد من دور المستخدم في Firestore
- تأكد من أن `role` = `super_admin` أو `center_admin`

## 🎯 الخطوات التالية

1. ✅ تفعيل Email/Password
2. ✅ إنشاء Super Admin
3. ✅ اختبار التسجيل
4. ✅ اختبار الدعوات
5. 🔲 (اختياري) إعداد Firebase Functions للبريد الإلكتروني

---

**للتفاصيل الكاملة:** اقرأ `RBAC_SETUP.md`
