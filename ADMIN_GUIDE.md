# Admin Guide: Center Display Order & Management

## 📋 Overview
This guide explains how to manage center display order and ensure accurate data representation in the search page.

## 🎯 Display Order Control

### Setting Display Order
To control the order of centers in the search results, update the `displayOrder` field in Firestore:

1. **Navigate to Firestore Console**
   - Go to Firebase Console → Firestore Database
   - Select the `centers` collection

2. **Edit Center Document**
   - Find the center document you want to prioritize
   - Add or update the field: `displayOrder` (type: number)
   - **Lower numbers = Higher priority**
     - `displayOrder: 1` → Appears first
     - `displayOrder: 2` → Appears second
     - No `displayOrder` → Appears last (sorted by creation date)

### Example Structure
```javascript
{
  id: "center-123",
  name: "مركز النور التعليمي",
  displayOrder: 1,  // This center will appear first
  status: "active",
  // ... other fields
}
```

## 📊 Required Fields for Each Center

### Essential Fields
```javascript
{
  // Basic Info
  name: string,              // Center name
  logo: string,              // Logo URL (optional)
  status: "active",          // MUST be "active" to appear in search
  
  // Location
  governorate: string,       // e.g., "القاهرة"
  area: string,             // e.g., "مدينة نصر"
  location: string,         // Full address
  
  // Educational Details
  stage: string,            // e.g., "إعدادي", "ثانوي"
  selectedGrades: [...],    // Array of grade IDs: ["prep1", "prep2", ...]
  subjects: [...],          // Array of subject names
  
  // Statistics
  teacherCount: number,     // Number of teachers (keep updated!)
  rating: number,           // Average rating (0-5)
  reviewCount: number,      // Number of reviews
  
  // Admin Control
  displayOrder: number,     // Optional: for custom sorting
  
  // Timestamps
  createdAt: Timestamp,
}
```

## 👨‍🏫 Managing Teacher Count

### Important: Keep teacherCount Accurate!

The `teacherCount` field should be updated whenever you:
1. Add a new teacher to the center
2. Remove a teacher from the center
3. Activate/deactivate a teacher

### Manual Update Steps
```javascript
// In Firestore Console or Admin Dashboard
1. Count teachers in subcollection: centers/{centerId}/teachers
2. Update the center document:
   {
     teacherCount: [actual_count]
   }
```

### Automatic Update (Recommended)
Implement a Cloud Function or Admin Dashboard feature to automatically sync teacher counts.

## 🔍 Filter Configuration

### Available Filters
1. **Governorate (المحافظة)**: Filters by `governorate` field
2. **Area (المنطقة)**: Filters by `area` field (dependent on governorate)
3. **Stage (المرحلة)**: Filters by `stage` field ("إعدادي", "ثانوي")
4. **Grade (الصف)**: Filters by `selectedGrades` array
5. **Subjects (المواد)**: Filters by `subjects` array
6. **Text Search**: Searches in:
   - Center name
   - Subjects
   - Location
   - Governorate
   - Area

## ✅ Center Status Management

### Status Values
- `"active"`: Center is visible in search results ✅
- `"inactive"`: Center is hidden from search ❌
- `"archived"`: Center is archived ❌
- `"pending"`: Center is awaiting approval ⏳

### To Show/Hide a Center
Update the `status` field in Firestore:
```javascript
{
  status: "active"  // Shows in search
}
// or
{
  status: "inactive"  // Hidden from search
}
```

## 🎨 Best Practices

### 1. Display Order Strategy
- Reserve 1-10 for premium/featured centers
- Leave most centers without `displayOrder` (they'll sort by creation date)
- Use gaps (1, 5, 10, 15) to allow easy insertion later

### 2. Data Quality
- ✅ Always set accurate `teacherCount`
- ✅ Keep `subjects` array updated
- ✅ Ensure `governorate` and `area` match the location data
- ✅ Use consistent naming (e.g., "القاهرة" not "cairo")

### 3. Search Optimization
- Use clear, descriptive center names
- Include popular subjects in the `subjects` array
- Add relevant keywords to center description

## 🚨 Troubleshooting

### Center Not Appearing in Search?
Check:
1. ✅ `status` is set to `"active"`
2. ✅ Center document exists in `centers` collection
3. ✅ Required fields are present (name, governorate, area, stage)

### Teacher Count is Wrong?
1. Count teachers in subcollection: `centers/{id}/teachers`
2. Update `teacherCount` field in center document
3. Verify in Admin Dashboard

### Filters Not Working?
1. Check field names match exactly (case-sensitive)
2. Verify data types (arrays vs strings)
3. Ensure `selectedGrades` is an array, not a string

## 📱 Firebase Console Links

- **Firestore Database**: `https://console.firebase.google.com/project/{project-id}/firestore`
- **Center Collection**: Navigate to `centers` collection
- **Teacher Subcollection**: `centers/{centerId}/teachers`

---

**Last Updated**: 2026-01-20
**Version**: 1.0
