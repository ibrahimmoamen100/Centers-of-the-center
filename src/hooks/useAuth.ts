import { useState, useEffect } from 'react';
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types/auth';

export function useAuth() {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                // Listen to user document for real-time updates
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeUser = onSnapshot(userDocRef, async (userSnapshot) => {
                    if (userSnapshot.exists()) {
                        setUser(userSnapshot.data() as User);
                        setLoading(false);
                    } else {
                        // Check if this is a legacy center account (exists in centers but not users)
                        try {
                            const centerDocRef = doc(db, 'centers', firebaseUser.uid);
                            const centerSnapshot = await getDoc(centerDocRef);

                            if (centerSnapshot.exists()) {
                                // It's a legacy center! Create user profile automatically
                                const centerData = centerSnapshot.data();
                                const newUserDoc: User = {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email || '',
                                    role: 'center_admin',
                                    centerId: firebaseUser.uid,
                                    status: 'active',
                                    displayName: centerData.name || centerData.centerName || 'Center Admin',
                                    createdAt: serverTimestamp() as Timestamp,
                                    updatedAt: serverTimestamp() as Timestamp,
                                };

                                await setDoc(userDocRef, newUserDoc);
                                // The snapshot listener will fire again with the new data
                            } else {
                                setUser(null);
                                setLoading(false);
                            }
                        } catch (err) {
                            console.error('Error checking legacy center:', err);
                            setUser(null);
                            setLoading(false);
                        }
                    }
                }, (error) => {
                    console.error('Error listening to user document:', error);
                    console.log('Ensure firestore.rules are deployed and allow reading users/{uid}');
                    setUser(null);
                    setLoading(false);
                });

                return () => unsubscribeUser();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signUp = async (
        email: string,
        password: string,
        userData: Partial<User>
    ) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Create user document in Firestore
            const userDoc: User = {
                uid,
                email,
                role: userData.role || 'user',
                status: userData.status || 'pending',
                displayName: userData.displayName,
                centerId: userData.centerId,
                createdAt: serverTimestamp() as Timestamp,
                updatedAt: serverTimestamp() as Timestamp,
            };

            await setDoc(doc(db, 'users', uid), userDoc);
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    return {
        firebaseUser,
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };
}
