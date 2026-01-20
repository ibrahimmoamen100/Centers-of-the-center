# Teacher Search Implementation Strategy

## 🎯 Challenge
Currently, teacher data is stored in a **subcollection** (`centers/{centerId}/teachers`), making it difficult to search across all teachers in all centers efficiently.

## 💡 Current Implementation

### What Works Now
- ✅ Search by center name
- ✅ Search by subjects
- ✅ Search by location (governorate, area)
- ✅ Filter by stage, grade, and subjects

### What's Limited
- ⚠️ Direct teacher name search requires fetching all subcollections (expensive)

## 🔧 Solution Options

### Option 1: Maintain Teacher Index (Recommended)
Create a separate `teachers` collection that mirrors subcollection data with center reference.

#### Structure
```javascript
// Collection: teachers
{
  id: "teacher-123",
  name: "أحمد محمد",
  photo: "url",
  subjects: ["رياضيات", "فيزياء"],
  centerId: "center-456",  // Reference to parent center
  centerName: "مركز النور",
  experience: "10 سنوات",
  rating: 4.8,
  status: "active"
}
```

#### Benefits
- ✅ Fast global teacher search
- ✅ Can search teacher name and get their center
- ✅ Easy to maintain with Cloud Functions

#### Implementation
1. Create a Cloud Function that syncs teacher updates:
   ```javascript
   // When teacher is added to subcollection
   exports.syncTeacherToIndex = functions.firestore
     .document('centers/{centerId}/teachers/{teacherId}')
     .onWrite(async (change, context) => {
       const teacherData = change.after.data();
       const { centerId, teacherId } = context.params;
       
       if (!teacherData) {
         // Delete from index
         await db.collection('teachers').doc(teacherId).delete();
       } else {
         // Update index
         await db.collection('teachers').doc(teacherId).set({
           ...teacherData,
           centerId,
           // Add center name for better search
           centerName: (await getCenterName(centerId))
         }, { merge: true });
       }
     });
   ```

2. Update search logic:
   ```typescript
   // In Search.tsx or a new useTeacherSearch hook
   const searchTeachers = async (query: string) => {
     const snapshot = await getDocs(
       query(
         collection(db, "teachers"),
         where("name", ">=", query),
         where("name", "<=", query + '\uf8ff'),
         where("status", "==", "active")
       )
     );
     
     const teachers = snapshot.docs.map(doc => doc.data());
     
     // Get unique centers containing matching teachers
     const centerIds = [...new Set(teachers.map(t => t.centerId))];
     return centerIds;
   };
   ```

---

### Option 2: Client-Side Loading (Current Implementation)
Load all centers, then for high-priority matches, fetch teacher subcollections.

#### Current Code
```typescript
// In Search.tsx
const filteredCenters = searchQuery
  ? centers.filter((center) => {
      const query = searchQuery.toLowerCase();
      
      // Search in basic fields
      if (center.name.toLowerCase().includes(query)) return true;
      if (center.subjects.some(s => s.toLowerCase().includes(query))) return true;
      
      // Note: Teacher search would require async loading
      // Not implemented to avoid performance issues
      
      return false;
    })
  : centers;
```

#### Limitations
- ❌ Cannot search teacher names without loading all subcollections
- ❌ Poor performance with many centers
- ❌ Not scalable

---

### Option 3: Denormalize Teacher Names
Store teacher names array in the center document.

#### Structure
```javascript
// In center document
{
  id: "center-123",
  name: "مركز النور",
  teacherCount: 15,
  teacherNames: ["أحمد محمد", "سارة علي", ...], // Denormalized
  // ... other fields
}
```

#### Benefits
- ✅ Fast search without subcollections
- ✅ No additional collection needed

#### Drawbacks
- ❌ Needs sync when teacher name changes
- ❌ Increases center document size

---

## ✅ Recommended Approach

### Use **Option 1** (Teacher Index Collection)

#### Step-by-Step Implementation

##### 1. Create Cloud Function
```javascript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

exports.syncTeacherIndex = functions.firestore
  .document('centers/{centerId}/teachers/{teacherId}')
  .onWrite(async (change, context) => {
    const { centerId, teacherId } = context.params;
    
    // Get center data
    const centerDoc = await db.collection('centers').doc(centerId).get();
    const centerData = centerDoc.data();
    
    if (!change.after.exists) {
      // Teacher deleted - remove from index
      await db.collection('teachers').doc(teacherId).delete();
      
      // Update teacher count
      await db.collection('centers').doc(centerId).update({
        teacherCount: admin.firestore.FieldValue.increment(-1)
      });
      
      return;
    }
    
    const teacherData = change.after.data();
    
    // Sync to index
    await db.collection('teachers').doc(teacherId).set({
      ...teacherData,
      centerId,
      centerName: centerData?.name || '',
      centerGovernorate: centerData?.governorate || '',
      centerArea: centerData?.area || '',
    }, { merge: true });
    
    // Update teacher count if new teacher
    if (!change.before.exists) {
      await db.collection('centers').doc(centerId).update({
        teacherCount: admin.firestore.FieldValue.increment(1)
      });
    }
  });
```

##### 2. Create Teacher Search Hook
```typescript
// src/hooks/useTeacherSearch.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useTeacherSearch(searchQuery: string) {
  const [centerIds, setCenterIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCenterIds([]);
      return;
    }
    
    const searchTeachers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(
          query(
            collection(db, 'teachers'),
            where('status', '==', 'active')
          )
        );
        
        const teachers = snapshot.docs.map(doc => doc.data());
        
        // Client-side filter (or use full-text search with Algolia)
        const matches = teachers.filter(t => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const uniqueCenterIds = [...new Set(matches.map(t => t.centerId))];
        setCenterIds(uniqueCenterIds);
      } catch (error) {
        console.error('Teacher search error:', error);
        setCenterIds([]);
      } finally {
        setLoading(false);
      }
    };
    
    searchTeachers();
  }, [searchQuery]);
  
  return { centerIds, loading };
}
```

##### 3. Update Search Page
```typescript
// In Search.tsx
import { useTeacherSearch } from '@/hooks/useTeacherSearch';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get centers matching teacher search
  const { centerIds: teacherCenterIds } = useTeacherSearch(searchQuery);
  
  // Combine filters
  const filteredCenters = centers.filter(center => {
    // If no search query, show all (filter by other criteria)
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Direct center match
    if (center.name.toLowerCase().includes(query)) return true;
    if (center.subjects.some(s => s.toLowerCase().includes(query))) return true;
    
    // Teacher match
    if (teacherCenterIds.includes(center.id)) return true;
    
    return false;
  });
  
  // ... rest of component
};
```

---

## 🚀 Deployment Steps

1. **Set up Firebase Functions**
   ```bash
   cd functions
   npm install firebase-functions firebase-admin
   npm run deploy
   ```

2. **Migrate Existing Data**
   Run a one-time script to populate the teacher index:
   ```typescript
   // scripts/migrateTeachers.ts
   const migrateCenterTeachers = async () => {
     const centers = await getDocs(collection(db, 'centers'));
     
     for (const centerDoc of centers.docs) {
       const teachers = await getDocs(
         collection(db, 'centers', centerDoc.id, 'teachers')
       );
       
       for (const teacherDoc of teachers.docs) {
         await setDoc(doc(db, 'teachers', teacherDoc.id), {
           ...teacherDoc.data(),
           centerId: centerDoc.id,
           centerName: centerDoc.data().name,
         });
       }
     }
   };
   ```

3. **Test the Search**
   - Add a teacher to a center
   - Verify it appears in the `teachers` collection
   - Search for the teacher name
   - Confirm the center appears in results

---

## 📊 Performance Comparison

| Approach | Initial Load | Search Speed | Maintenance |
|----------|--------------|--------------|-------------|
| Subcollection Only | Fast | Very Slow | Low |
| Teacher Index | Fast | Fast | Automatic |
| Denormalized | Fast | Fast | Manual |

**Winner**: Teacher Index Collection (Option 1) ✅

---

**Implementation Status**: 
- ⏳ Awaiting deployment (Cloud Function needed)
- ✅ Frontend prepared for teacher search
- ⏳ One-time migration script needed

**Next Steps**:
1. Deploy Cloud Function
2. Run migration script
3. Test teacher search
4. Update UI to show teacher matches
