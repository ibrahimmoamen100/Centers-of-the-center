/**
 * Create Super Admin Script
 * 
 * This script helps create the first Super Admin account
 * 
 * Prerequisites:
 * 1. Firebase Admin SDK installed: npm install firebase-admin
 * 2. Service account key downloaded from Firebase Console
 * 
 * Usage:
 * node scripts/create-super-admin.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt user for input
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function createSuperAdmin() {
    try {
        console.log('\n🔐 إنشاء حساب Super Admin\n');
        console.log('⚠️  تأكد من وجود ملف serviceAccountKey.json في المجلد الرئيسي\n');

        // Try to initialize Firebase Admin
        try {
            const serviceAccount = require('../serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ تم الاتصال بـ Firebase بنجاح\n');
        } catch (error) {
            console.error('❌ خطأ في الاتصال بـ Firebase:');
            console.error('   تأكد من وجود ملف serviceAccountKey.json');
            console.error('   قم بتحميله من: Firebase Console > Project Settings > Service Accounts\n');
            process.exit(1);
        }

        // Get user input
        const email = await prompt('📧 البريد الإلكتروني للمسؤول: ');
        const password = await prompt('🔑 كلمة المرور (6 أحرف على الأقل): ');
        const displayName = await prompt('👤 الاسم (اختياري): ') || 'مسؤول النظام';

        console.log('\n⏳ جاري إنشاء الحساب...\n');

        // 1. Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: displayName,
        });

        console.log('✅ تم إنشاء حساب المصادقة');

        // 2. Create Firestore user document
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            role: 'super_admin',
            status: 'active',
            displayName: displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ تم إنشاء ملف المستخدم في Firestore\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 تم إنشاء Super Admin بنجاح!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📋 معلومات الحساب:');
        console.log(`   البريد: ${email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   الاسم: ${displayName}`);
        console.log(`   الدور: Super Admin\n`);
        console.log('🔗 يمكنك الآن تسجيل الدخول من:');
        console.log('   http://localhost:5173/admin/login\n');

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ حدث خطأ:', error.message);

        if (error.code === 'auth/email-already-exists') {
            console.error('   البريد الإلكتروني مستخدم بالفعل');
        } else if (error.code === 'auth/weak-password') {
            console.error('   كلمة المرور ضعيفة جداً (يجب 6 أحرف على الأقل)');
        } else if (error.code === 'auth/invalid-email') {
            console.error('   البريد الإلكتروني غير صحيح');
        }

        console.log('');
        rl.close();
        process.exit(1);
    }
}

// Run the script
createSuperAdmin();
