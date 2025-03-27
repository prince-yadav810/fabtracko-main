
# Authentication Documentation

## Overview
This document outlines the authentication system implemented for Vikas Fabrication Works application. The system uses hard-coded credentials secured with bcrypt hashing for authentication, while all other data is stored in MongoDB.

## Authentication Mechanism

### Credentials Storage
The authentication credentials are hard-coded in the backend code:
- Username: `vikasfabtech`
- Password: `passfabtech` (stored as a bcrypt hash in the code)

Despite being hard-coded, the password is securely hashed using bcrypt to maintain security best practices.

### Security Considerations
- The password is stored in hashed form in the code, not as plaintext
- JWT tokens are still used for session management and API authorization
- Token expiration is set to 24 hours for additional security

## Authentication Flow

### Login Process
1. User submits credentials (username and password)
2. Server compares the submitted username against the hard-coded username
3. If usernames match, the server uses bcrypt to compare the submitted password with the stored password hash
4. On successful validation, a JWT is generated and returned to the client
5. Client stores the JWT in local storage
6. Subsequent API requests include the JWT in the Authorization header

### Protected Routes
All API endpoints except the authentication endpoints require authentication. The JWT must be included in the Authorization header as a Bearer token:

```
Authorization: Bearer <token>
```

### Frontend Implementation
The frontend uses an AuthContext provider that:
- Initializes authentication on app load
- Provides login/logout functionality
- Handles protected routes
- Manages the current user state

## Database Organization
While authentication credentials are hard-coded, all other application data continues to be stored in MongoDB:
- Worker details (profile information, wages, etc.)
- Attendance records
- Payment records

## Troubleshooting
- If login fails, ensure you are using the correct credentials: username `vikasfabtech` and password `passfabtech`
- If API requests are failing with 401 errors, check that the JWT is valid and not expired
- For security auditing, check server logs for unauthorized access attempts

