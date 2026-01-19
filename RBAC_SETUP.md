# نظام إدارة الأدوار والصلاحيات للمراكز

## 🎯 نظرة عامة

نظام شامل لإدارة المراكز التعليمية بثلاثة مستويات من الصلاحيات:
- **Super Admin**: المسؤول الرئيسي - إدارة كاملة للنظام
- **Center Admin**: مسؤول المركز - إدارة مركز واحد فقط
- **User**: المستخدم العادي - تصفح وحجز الخدمات

## 🚀 خطوات التفعيل

### 1. تفعيل Email/Password في Firebase Console

⚠️ **هذه الخطوة ضرورية لحل خطأ `auth/operation-not-allowed`**

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **center-of-the-centers**
3. من القائمة الجانبية، اختر **Authentication**
4. اضغط على تبويب **Sign-in method**
5. في قائمة مقدمي الخدمة (Providers):
   - ابحث عن **Email/Password**
   - اضغط على أيقونة القلم لتحريره
   - قم بتفعيل الخيار الأول **Email/Password** (Enable)
   - اضغط **Save**

### 2. نشر Security Rules

قم بنشر قواعد الأمان الجديدة:

```bash
firebase deploy --only firestore:rules
```

أو من Firebase Console:
1. اذهب إلى **Firestore Database**
2. اختر تبويب **Rules**
3. انسخ محتوى ملف `firestore.rules`
4. الصقه في المحرر
5. اضغط **Publish**

### 3. إنشاء حساب Super Admin الأول

يجب إنشاء حساب Super Admin يدوياً في Firebase Console:

#### الطريقة الأولى: من Firebase Console

1. اذهب إلى **Authentication**
2. اضغط **Add user**
3. أدخل:
   - Email: `admin@example.com` (أو البريد الذي تريده)
   - Password: كلمة مرور قوية
4. اضغط **Add user**
5. انسخ الـ **UID** الخاص بالمستخدم
6. اذهب إلى **Firestore Database**
7. اضغط **Start collection**
8. اسم المجموعة: `users`
9. Document ID: الصق الـ **UID** المنسوخ
10. أضف الحقول التالية:

```
uid: <الصق الـ UID>
email: admin@example.com
role: super_admin
status: active
displayName: مسؤول النظام
createdAt: <اضغط على أيقونة الساعة واختر server timestamp>
updatedAt: <اضغط على أيقونة الساعة واختر server timestamp>
```

#### الطريقة الثانية: باستخدام Firebase Admin SDK (مستحسن)

يمكنك إنشاء سكريبت Node.js:

```javascript
// create-super-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createSuperAdmin() {
  try {
    // 1. Create auth user
    const userRecord = await admin.auth().createUser({
      email: 'admin@example.com',
      password: 'YourStrongPassword123!',
      displayName: 'مسؤول النظام',
    });

    // 2. Create Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: 'admin@example.com',
      role: 'super_admin',
      status: 'active',
      displayName: 'مسؤول النظام',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email:', userRecord.email);
    console.log('UID:', userRecord.uid);
  } catch (error) {
    console.error('Error:', error);
  }
}

createSuperAdmin();
```

## 📋 الملفات الجديدة المُنشأة

### Types & Interfaces
- `src/types/auth.ts` - تعريفات الأنواع للأدوار والمستخدمين والدعوات

### Custom Hooks
- `src/hooks/useAuth.ts` - إدارة المصادقة والأدوار
- `src/hooks/useUserRole.ts` - الحصول على دور المستخدم

### Components
- `src/components/ProtectedRoute.tsx` - حماية المسارات حسب الدور
- `src/components/admin/InvitationsManagement.tsx` - إدارة الدعوات للـ Super Admin

### Pages
- `src/pages/AdminLogin.tsx` - صفحة تسجيل دخول المسؤول
- `src/pages/AcceptInvitation.tsx` - صفحة قبول الدعوة
- `src/pages/Unauthorized.tsx` - صفحة عدم التصريح

### Configuration
- `firestore.rules` - قواعد أمان Firebase مع RBAC

### Updated Files
- `src/pages/CenterRegister.tsx` - تحديث لإنشاء user document مع الدور
- `src/App.tsx` - إضافة المسارات المحمية

## 🔐 الأدوار والصلاحيات

### Super Admin
**الصلاحيات:**
- ✅ الوصول إلى `/admin/dashboard`
- ✅ عرض جميع المراكز
- ✅ تفعيل/تعطيل/حذف المراكز
- ✅ إرسال دعوات لمسؤولي المراكز
- ✅ تعيين/إلغاء أدوار المستخدمين
- ✅ عرض تقارير شاملة

**كيفية تسجيل الدخول:**
- المسار: `/admin/login`

### Center Admin
**الصلاحيات:**
- ✅ الوصول إلى `/center/dashboard`
- ✅ إدارة بيانات مركزه فقط
- ✅ تعديل معلومات المركز
- ✅ إضافة/تعديل خدمات المركز
- ✅ عرض إحصائيات المركز
- ❌ لا يمكنه الوصول لصفحة المسؤول
- ❌ لا يمكنه إدارة مراكز أخرى

**طرق الحصول على الدور:**
1. التسجيل الذاتي: `/center/register`
2. قبول دعوة من Super Admin: `/invitation/accept?token=xxx`

### User
**الصلاحيات:**
- ✅ التصفح العام
- ✅ حجز خدمات المراكز
- ✅ عرض الملف الشخصي

## 🔄 سير العمل (User Flows)

### 1. تسجيل مركز جديد (Self Registration)

```
المستخدم → /center/register
  ↓
يملأ النموذج (اسم المركز، البريد، كلمة المرور، إلخ)
  ↓
النظام ينشئ:
  - حساب Firebase Auth
  - document في users collection (role: center_admin, status: pending)
  - document في centers collection (status: pending)
  ↓
إعادة توجيه إلى /center/dashboard
```

### 2. دعوة مسؤول مركز من Super Admin

```
Super Admin → /admin/dashboard
  ↓
يضغط على "إرسال دعوة"
  ↓
يدخل البريد الإلكتروني + يختار المركز
  ↓
النظام ينشئ invitation document برمز فريد
  ↓
يتم نسخ رابط الدعوة: /invitation/accept?token=xxx
  ↓
Super Admin يرسل الرابط للمدعو
  ↓
المدعو يفتح الرابط:
  - إذا لم يكن مسجلاً: يُنشئ حساب جديد
  - إذا كان مسجلاً: يتم تحديث دوره
  ↓
إعادة توجيه إلى /center/dashboard
```

### 3. التحقق من الدور عند الدخول

```
المستخدم يسجل الدخول
  ↓
useAuth hook يجلب user document من Firestore
  ↓
يحصل على الدور (role) و centerId
  ↓
المستخدم يحاول الدخول لصفحة محمية
  ↓
ProtectedRoute يتحقق من الدور:
  - مطابق ✅ → يسمح بالدخول
  - غير مطابق ❌ → redirect إلى /unauthorized
  - غير مسجل ❌ → redirect إلى /center/login
```

## 🗂️ هيكل البيانات في Firestore

### Collection: `users`

```typescript
{
  uid: string,
  email: string,
  role: 'super_admin' | 'center_admin' | 'user',
  centerId?: string, // فقط إذا كان center_admin
  status: 'active' | 'pending' | 'suspended',
  displayName: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `centers`

```typescript
{
  id: string, // auto-generated
  name: string,
  email: string,
  adminUid: string, // UID الخاص بمسؤول المركز
  status: 'active' | 'pending' | 'suspended',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string, // UID للمستخدم الذي أنشأ المركز
  // ... باقي حقول المركز
}
```

### Collection: `invitations`

```typescript
{
  id: string,
  email: string,
  role: 'center_admin',
  centerId: string,
  centerName: string,
  invitedBy: string, // UID للـ super admin
  status: 'pending' | 'accepted' | 'rejected' | 'expired',
  token: string, // رمز فريد للتحقق
  expiresAt: Timestamp, // صلاحية 7 أيام
  createdAt: Timestamp,
  acceptedAt?: Timestamp
}
```

## 🧪 الاختبار

### 1. اختبار تسجيل مركز جديد

1. افتح `/center/register`
2. املأ النموذج بالكامل
3. اضغط "إنشاء الحساب"
4. تأكد من:
   - ✅ إنشاء حساب Firebase Auth
   - ✅ إنشاء document في `users` برقم `center_admin`
   - ✅ إنشاء document في `centers`
   - ✅ إعادة التوجيه إلى `/center/dashboard`

### 2. اختبار تسجيل دخول Super Admin

1. افتح `/admin/login`
2. سجل دخول بحساب Super Admin
3. تأكد من الوصول إلى `/admin/dashboard`

### 3. اختبار إرسال دعوة

1. سجل دخول كـ Super Admin
2. اذهب إلى قسم الدعوات
3. أدخل بريد إلكتروني + اختر مركز
4. اضغط "إرسال الدعوة"
5. انسخ رابط الدعوة
6. افتح الرابط في نافذة متصفح خاصة
7. أنشئ حساب جديد
8. تأكد من:
   - ✅ تحديث حالة الدعوة إلى `accepted`
   - ✅ إنشاء user document بدور `center_admin`
   - ✅ ربط المستخدم بالـ `centerId` الصحيح

### 4. اختبار حماية المسارات

1. افتح `/admin/dashboard` بدون تسجيل دخول
   - ✅ يجب إعادة التوجيه إلى `/admin/login`

2. سجل دخول كـ Center Admin
3. حاول فتح `/admin/dashboard`
   - ✅ يجب إعادة التوجيه إلى `/unauthorized`

4. سجل دخول كـ Super Admin
5. حاول فتح `/center/dashboard`
   - ✅ يجب إعادة التوجيه إلى `/unauthorized`

## ❌ حل المشاكل الشائعة

### خطأ: `auth/operation-not-allowed`

**السبب:** لم يتم تفعيل Email/Password في Firebase Console

**الحل:**
1. اذهب إلى Firebase Console
2. Authentication > Sign-in method
3. فعّل Email/Password

### خطأ: `Cannot find module '@/types/auth'`

**السبب:** ملف الأنواع غير موجود

**الحل:**
```bash
# تأكد من وجود الملف
ls src/types/auth.ts
```

### خطأ: رسالة "غير مصرح لك بالدخول"

**السبب:** الدور غير مطابق للصفحة

**الحل:**
1. تحقق من دور المستخدم في Firestore
2. تأكد من أن الدور صحيح (`super_admin`, `center_admin`, `user`)
3. تأكد من أن `centerId` موجود لمسؤولي المراكز

## 📚 الخطوات التالية

### مرحلة متقدمة (اختياري)

1. **إرسال بريد إلكتروني للدعوات:**
   - استخدام Firebase Functions
   - تكامل مع SendGrid أو Mailgun

2. **لوحة تحكم Super Admin محسّنة:**
   - إحصائيات شاملة
   - تقارير مفصلة
   - إدارة الاشتراكات

3. **نظام الإشعارات:**
   - إشعار عند تسجيل مركز جديد
   - إشعار عند قبول دعوة

4. **تسجيل الدخول بأكثر من طريقة:**
   - Google Sign-In
   - Facebook Login

## 🎉 تم بنجاح!

الآن لديك نظام كامل لإدارة الأدوار والصلاحيات. جميع المستخدمين لديهم صلاحيات محددة بوضوح، والمسارات محمية بشكل آمن.

**ملاحظة مهمة:** لا تنسَ تفعيل Email/Password في Firebase Console قبل الاختبار!
