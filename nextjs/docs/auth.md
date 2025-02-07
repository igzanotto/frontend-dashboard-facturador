# Authentication Documentation

## Overview
This project implements a robust authentication system using Supabase Auth with Next.js 13+. The system includes features like email/password authentication, MFA (Multi-Factor Authentication), password reset, and email verification.

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── auth/
│   │   ├── 2fa/               # Two-factor authentication
│   │   ├── forgot-password/   # Password recovery
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── reset-password/   # Password reset
│   │   └── verify-email/     # Email verification
│   └── api/
│       └── auth/
│           └── callback/     # Auth callback handling
├── middleware.ts            # Auth middleware
└── lib/
    └── supabase/           # Supabase client utilities
```

## Authentication Flow

1. **Middleware Protection**
   - The application uses a middleware (`middleware.ts`) that intercepts all routes
   - It updates the session using Supabase's `updateSession` function
   - Protects routes and maintains authentication state

2. **Authentication Process**
   - Users can register or login through dedicated pages
   - After successful authentication, they're redirected to the callback route
   - The callback route (`/api/auth/callback`) handles:
     - Code exchange for session
     - MFA verification check
     - Appropriate redirections based on auth status

3. **Multi-Factor Authentication (MFA)**
   - The system supports 2FA
   - After initial login, users may be required to complete MFA
   - MFA status is checked in the callback route
   - Users are redirected to `/auth/2fa` if MFA verification is needed

4. **Password Recovery**
   - Users can initiate password reset through the forgot-password flow
   - Reset links are sent via email
   - Password reset is handled through a dedicated reset-password route

5. **Email Verification**
   - New registrations require email verification
   - Verification links are sent to users' email
   - Verification status is handled through the verify-email route

## Security Features

1. **Protected Routes**
   - All non-public routes are protected by the middleware
   - Session validation occurs on every request
   - Unauthorized access attempts are redirected to login

2. **Session Management**
   - Sessions are managed by Supabase
   - The middleware ensures session freshness
   - Invalid sessions are automatically handled

## Integration with Supabase

The authentication system is built on top of Supabase Auth, utilizing:
- Server-side Supabase client for secure operations
- Client-side authentication state management
- Secure session handling
- Built-in security features from Supabase

## Best Practices

1. **Security**
   - All authentication state is managed server-side
   - Sensitive operations occur in protected API routes
   - Session tokens are handled securely

2. **User Experience**
   - Clear authentication flows
   - Proper error handling
   - Intuitive navigation between auth states

3. **Maintenance**
   - Modular architecture for easy updates
   - Clear separation of concerns
   - Centralized auth logic
