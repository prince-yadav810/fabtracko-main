
# Authentication Documentation

## Current Status
**IMPORTANT: Authentication is currently disabled in this application.**

This document outlines the authentication system that was previously implemented for Vikas Fabrication Works application and provides instructions on how to re-enable it if needed. The authentication system uses a custom server-side authentication with JWT (JSON Web Tokens) and MongoDB for credential storage.

## Authentication Implementation Details

The application includes a complete authentication system that is currently disabled but preserved in the codebase:

- **Authentication Context**: Located in `src/context/AuthContext.tsx`
- **Protected Route Component**: Located in `src/components/ProtectedRoute.tsx`
- **Authentication Service**: Located in `src/services/authService.ts`
- **Server-side Authentication**: Backend middleware and routes in `backend/middleware/auth.js` and `backend/routes/auth.js`

### Credentials for Testing

When authentication is enabled, the following credentials can be used:
- Username: `vikasfabtech`
- Password: `passfabtech`

## How to Re-enable Authentication

To re-enable the authentication system, follow these steps:

### 1. Modify App.tsx

Update the `App.tsx` file to:
- Import the AuthProvider
- Wrap components in the AuthProvider
- Re-add the login route
- Protect routes that require authentication

```tsx
// In App.tsx
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage"; // You'll need to create this
import ProtectedRoute from "./components/ProtectedRoute";

// ...

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/workers" element={<WorkerPage />} />
                <Route path="/workers/add" element={<AddWorkerPage />} />
                <Route path="/workers/:workerId" element={<WorkerPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/reports" element={<ReportPage />} />
              </Route>
              
              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

### 2. Create Login Page

Create a new LoginPage component at `src/pages/LoginPage.tsx`:

```tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(username, password);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      let errorMessage = "Login failed. Please check your credentials.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Vikas Fabrication Works</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <User size={16} />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <LockKeyhole size={16} />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
```

### 3. Ensure Backend Is Properly Configured

1. Make sure your `backend/.env` file includes:
   - `JWT_SECRET`: A secure random string for signing JWTs
   - `ADMIN_USERNAME`: Set to 'vikasfabtech'
   - `ADMIN_PASSWORD`: Set to 'passfabtech'

2. Verify that the backend server is running and properly configured to handle authentication requests.

### 4. Test The Authentication Flow

1. Start the application
2. Navigate to `/login`
3. Enter the credentials (vikasfabtech/passfabtech)
4. Verify that you're redirected to the home page after successful login
5. Try accessing a protected route without logging in to confirm it redirects to the login page

## Server-Side Authentication Configuration

The backend uses JWT for authentication:

- **Token Creation**: Happens in `backend/routes/auth.js` during login
- **Token Verification**: Middleware in `backend/middleware/auth.js`
- **MongoDB Integration**: User model in `backend/models/User.js`

## Security Considerations
- Passwords are hashed using bcrypt before storage
- JWTs expire after 24 hours
- Authentication middleware validates tokens on each protected request
- Failed login attempts return generic error messages to prevent user enumeration

## Troubleshooting
- If login fails, check that the username and password match the credentials in the database
- If API requests are failing with 401 errors, check that the JWT is valid and not expired
- For security auditing, check server logs for unauthorized access attempts
