
# Authentication Documentation

## Overview
This document outlines the authentication system implemented for Vikas Fabrication Works application. The system uses a custom server-side authentication with JWT (JSON Web Tokens) and MongoDB for credential storage.

## Setup Instructions

### Backend Configuration
1. Create a `.env` file in the backend directory based on `.env.example`
2. Set the following variables:
   - `JWT_SECRET`: A secure random string for signing JWTs
   - `ADMIN_USERNAME`: Default admin username
   - `ADMIN_PASSWORD`: Default admin password

### Initialize Admin User
On first deployment, the admin user needs to be initialized. This happens automatically when the server starts if no users exist in the database.

Alternatively, you can make a POST request to `/api/auth/init` to create the admin user:
```
POST /api/auth/init
```

This endpoint will only work if no users exist in the database.

## Authentication Flow

### Login Process
1. User submits credentials (username and password)
2. Server validates credentials against the stored hashed password
3. On successful validation, a JWT is generated and returned to the client
4. Client stores the JWT in local storage
5. Subsequent API requests include the JWT in the Authorization header

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

## Security Considerations
- Passwords are hashed using bcrypt before storage
- JWTs expire after 24 hours
- Authentication middleware validates tokens on each protected request
- Failed login attempts return generic error messages to prevent user enumeration

## Troubleshooting
- If login fails, check that the username and password match the credentials in the database
- If API requests are failing with 401 errors, check that the JWT is valid and not expired
- For security auditing, check server logs for unauthorized access attempts
