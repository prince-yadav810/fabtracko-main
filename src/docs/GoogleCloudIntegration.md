
# Google Cloud Integration Documentation

This document provides an overview of the Google Cloud integration implemented in the Vikas Fabrication Works application.

## Overview

The application now uses Firebase (a Google Cloud service) for data storage and management. The transition from local storage to Firebase ensures that all data is securely stored in the cloud while maintaining the exact same user interface and experience.

## Architecture

The integration consists of the following components:

1. **Firebase Configuration** (`src/config/firebase.ts`)
   - Initializes the Firebase app and Firestore database
   - Contains the Firebase project configuration

2. **Firebase Service** (`src/services/firebaseService.ts`)
   - Provides methods for CRUD operations on all data collections
   - Manages data synchronization between the app and Firestore
   - Handles error scenarios and reporting

3. **Application Context** (`src/context/AppContext.tsx`)
   - Updated to use Firebase services instead of local state management
   - Maintains the same API interface for components to ensure seamless transition
   - Handles data loading, caching, and state management

## Data Collections

The Firebase Firestore database is organized into three main collections:

1. **workers** - Stores worker profile information
   - Fields: name, profilePicture, joiningDate, dailyWage

2. **attendance** - Stores attendance records
   - Fields: workerId, date, status

3. **payments** - Stores payment records
   - Fields: workerId, date, amount, type

## Implementation Details

### Data Migration

The application automatically checks if data exists in Firebase. If no data is found, it seeds sample data on the first run. This ensures a smooth transition from local storage to Firebase.

### Error Handling

All Firebase operations include error handling to ensure the application remains stable even when network issues occur. Errors are logged to the console and displayed to users via toast notifications.

### Offline Support

Firebase Firestore provides built-in offline support. When the application is offline, it will continue to function using cached data and queue operations for when the connection is restored.

## Maintenance and Troubleshooting

### Common Issues

1. **Data not loading**: Check the browser console for error messages. Ensure that the Firebase project is properly configured and that the Firebase rules allow read/write operations.

2. **Performance issues**: If the application becomes slow, consider implementing pagination for large collections or optimizing queries.

### Firebase Console

The Firebase console can be accessed at https://console.firebase.google.com/ to manage the database, monitor usage, and configure security rules.

## Security Considerations

1. The Firebase configuration in this application uses public API keys that are safe to include in client-side code.

2. For production deployments, ensure that proper Firebase security rules are in place to control data access and prevent unauthorized modifications.

3. Consider implementing authentication for a complete production solution.
