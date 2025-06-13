# Debugging Guide for Notes Upload Form

## Common Issues and Solutions

### 1. Check Firebase Console for Errors

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "b-tech-notes-e18ee"
3. Navigate to "Authentication" to verify the user is properly authenticated
4. Check "Storage" to see if files are being uploaded
5. Check "Firestore Database" to see if documents are being created
6. Look at "Functions" logs if you have any cloud functions

### 2. Check Security Rules

#### Firestore Rules
Make sure your Firestore rules allow:
- Authenticated users to create documents in the `noteRequests` collection
- The user ID in the document matches the authenticated user's ID

To deploy the updated rules:
```bash
firebase deploy --only firestore:rules
```

#### Storage Rules
Make sure your Storage rules allow:
- Authenticated users to upload files to their own folder
- Proper file size and type validation

To deploy the updated rules:
```bash
firebase deploy --only storage:rules
```

### 3. Browser Console Debugging

Add these debugging logs to your code:

```javascript
// Before file upload
console.log("Starting file upload", {
  file,
  currentUser: currentUser?.uid,
  path: `notes/${currentUser?.uid}/${Date.now()}_${file.name}`
});

// After successful upload but before Firestore
console.log("File uploaded successfully", {
  downloadURL,
  storageRef: storageRef.fullPath
});

// Before Firestore document creation
console.log("Creating Firestore document", {
  userId: currentUser.uid,
  title,
  yearId: selectedYearId,
  semesterId: selectedSemesterId,
  subjectId: selectedSubjectId
});

// After document creation
console.log("Document created successfully", docRef.id);
```

### 4. Network Tab Inspection

1. Open browser DevTools (F12 or right-click > Inspect)
2. Go to the Network tab
3. Filter by "XHR" or "Fetch" requests
4. Submit the form and look for:
   - Storage upload requests (look for 200 OK status)
   - Firestore document creation requests (look for 200 OK status)
5. Check for any failed requests (red entries)

### 5. Common Firebase Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `permission-denied` | User doesn't have permission | Check security rules |
| `unauthorized` | User not authenticated or token expired | Re-authenticate user |
| `quota-exceeded` | Storage or Firestore quota exceeded | Check billing or limits |
| `unavailable` | Service temporarily unavailable | Retry with exponential backoff |
| `resource-exhausted` | Too many requests | Implement rate limiting |

### 6. Testing Authentication State

Add this check before form submission:

```javascript
if (!currentUser) {
  console.error("User not authenticated");
  toast.error("You must be logged in to upload notes");
  return;
}

console.log("Current user state:", {
  uid: currentUser.uid,
  email: currentUser.email,
  isAnonymous: currentUser.isAnonymous,
  emailVerified: currentUser.emailVerified
});
```

### 7. Checking for Silent Failures

The most common causes of silent failures:

1. **Security Rules**: Incorrect rules that deny write operations
2. **Race Conditions**: File upload succeeds but Firestore write fails
3. **Network Issues**: Intermittent connectivity problems
4. **Auth Token Expiry**: User's authentication token expired during the operation

### 8. Testing with Firebase Emulator

For local testing:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize emulator: `firebase init emulators`
3. Start emulators: `firebase emulators:start`
4. Update your code to connect to emulators:

```javascript
// In firebase.ts
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

This will help isolate if the issue is with your code or with Firebase configuration. 