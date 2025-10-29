# User Management & Authentication System

Complete backend user management system for the Real Estate Brokerage Break-Even Analyzer.

## 🔐 Features

### Authentication
- ✅ **Sign Up** - Create new user accounts with email/password
- ✅ **Sign In** - Authenticate existing users
- ✅ **Sign Out** - Secure logout functionality
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Email Confirmation** - Verify user emails (configurable)
- ✅ **Session Management** - Automatic token refresh
- ✅ **Protected Routes** - Secure access to user-specific features

### User Experience
- 🎨 Beautiful, animated UI with Framer Motion
- 📱 Fully responsive design
- 🌓 Light/Dark mode support
- ✨ Real-time validation and error handling
- ⚡ Fast, seamless transitions
- 💬 Clear success/error messages

## 📁 File Structure

```
app/
├── auth/
│   ├── page.tsx                 # Main auth page (sign in/sign up/reset)
│   ├── callback/
│   │   └── page.tsx            # Email confirmation callback
│   └── reset-password/
│       └── page.tsx            # Password reset form
lib/
└── auth.ts                      # Auth helper functions
components/
└── navbar.tsx                   # Navbar with auth state
```

## 🚀 Usage

### Sign Up

```typescript
import { signUp } from "@/lib/auth";

const result = await signUp("user@example.com", "password123");

if (result.success) {
  console.log("Account created!", result.user);
} else {
  console.error(result.message);
}
```

### Sign In

```typescript
import { signIn } from "@/lib/auth";

const result = await signIn("user@example.com", "password123");

if (result.success) {
  // Redirect to dashboard
  router.push("/");
} else {
  console.error(result.message);
}
```

### Sign Out

```typescript
import { signOut } from "@/lib/auth";

const result = await signOut();

if (result.success) {
  router.push("/");
}
```

### Password Reset

```typescript
import { resetPassword } from "@/lib/auth";

// Send reset email
const result = await resetPassword("user@example.com");

if (result.success) {
  console.log("Reset email sent!");
}
```

### Update Password

```typescript
import { updatePassword } from "@/lib/auth";

// After clicking reset link in email
const result = await updatePassword("newPassword123");

if (result.success) {
  console.log("Password updated!");
}
```

### Get Current User

```typescript
import { getCurrentUser, isAuthenticated } from "@/lib/auth";

const user = await getCurrentUser();
const authenticated = await isAuthenticated();
```

## 🔧 Configuration

### Supabase Auth Settings

Go to [Supabase Dashboard](https://supabase.com/dashboard/project/eamywkblubazqmepaxmm/auth/users) → Authentication → Settings:

#### Email Confirmation (Optional)

For **production**, enable email confirmation:
1. Go to Authentication → Email Templates
2. Customize "Confirm signup" template
3. Enable "Confirm email" in Authentication → Settings

For **development/testing**, disable email confirmation:
1. Go to Authentication → Settings
2. Disable "Enable email confirmations"
3. Users can sign in immediately after signup

#### Email Templates

Customize email templates in Authentication → Email Templates:

- **Confirm signup**: Email sent after registration
- **Reset password**: Password reset link
- **Magic Link**: Passwordless authentication (if enabled)

#### Redirect URLs

Add these URLs to "Redirect URLs" in Authentication → URL Configuration:

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/reset-password
```

## 🛡️ Security Features

### Row Level Security (RLS)

All user data is protected with RLS policies:

```sql
-- Users can only read their own records
create policy "read own" on public.break_even_records
  for select using (auth.uid() = user_id);

-- Users can only insert their own records
create policy "insert own" on public.break_even_records
  for insert with check (auth.uid() = user_id);

-- Users can only delete their own records
create policy "delete own" on public.break_even_records
  for delete using (auth.uid() = user_id);
```

### Password Requirements

- Minimum 6 characters
- Enforced on both client and server
- Validated before submission

### Session Management

- Automatic token refresh
- Secure cookie storage
- Session persistence across page reloads

## 📋 User Flow

### Sign Up Flow

1. User visits `/auth`
2. Clicks "Don't have an account? Sign up"
3. Enters email and password
4. Submits form
5. **Option A** (Email confirmation enabled):
   - Check email for confirmation link
   - Click link → Redirected to `/auth/callback`
   - Confirmed → Redirected to dashboard
6. **Option B** (Email confirmation disabled):
   - Automatically signed in
   - Redirected to dashboard

### Sign In Flow

1. User visits `/auth`
2. Enters email and password
3. Submits form
4. Authenticated → Redirected to dashboard

### Password Reset Flow

1. User visits `/auth`
2. Clicks "Forgot password?"
3. Enters email
4. Submits form
5. Checks email for reset link
6. Clicks link → Redirected to `/auth/reset-password`
7. Enters new password
8. Password updated → Redirected to dashboard

## 🎨 UI Components

### Auth Page (`/auth`)

**Features:**
- Sign In form
- Sign Up form
- Forgot Password form
- Toggle between modes
- Animated transitions
- Error/success messages
- Loading states

### Navbar

**Features:**
- Shows user email when signed in
- Sign Out button
- "Sign In" button when not authenticated
- Real-time auth state updates

### Protected Routes

The `/history` page is protected and requires authentication:

```typescript
useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    setUser(user);
    loadRecords();
  };
  checkUser();
}, [router]);
```

## 🔌 API Reference

### `signUp(email, password)`

Create a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (min 6 chars)

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  user?: User;
}
```

### `signIn(email, password)`

Authenticate an existing user.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  user?: User;
}
```

### `signOut()`

Sign out the current user.

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

### `resetPassword(email)`

Send a password reset email.

**Parameters:**
- `email` (string): User's email address

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

### `updatePassword(newPassword)`

Update the user's password (called from reset link).

**Parameters:**
- `newPassword` (string): New password (min 6 chars)

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

### `getCurrentUser()`

Get the currently authenticated user.

**Returns:**
```typescript
User | null
```

### `isAuthenticated()`

Check if a user is currently authenticated.

**Returns:**
```typescript
boolean
```

## 🐛 Troubleshooting

### "Invalid login credentials"

- Check email and password are correct
- Verify email is confirmed (if confirmation enabled)
- Try password reset if forgotten

### "User already registered"

- Email is already in use
- Try signing in instead
- Use password reset if forgotten

### Email confirmation not received

- Check spam folder
- Verify email address is correct
- Ensure Supabase email settings are configured
- Check Supabase logs for delivery issues

### Password reset not working

- Verify email address is registered
- Check spam folder for reset email
- Ensure redirect URLs are configured in Supabase
- Reset link expires after 1 hour

### Session not persisting

- Check browser cookies are enabled
- Verify Supabase URL and anon key are correct
- Clear browser cache and try again

## 📊 Monitoring

### Supabase Dashboard

Monitor authentication in the Supabase Dashboard:

1. **Users**: View all registered users
   - [Auth → Users](https://supabase.com/dashboard/project/eamywkblubazqmepaxmm/auth/users)

2. **Logs**: View authentication events
   - [Logs](https://supabase.com/dashboard/project/eamywkblubazqmepaxmm/logs/explorer)

3. **Email**: Monitor email delivery
   - Authentication → Email Templates

## 🚀 Testing

### Manual Testing Checklist

- [ ] Sign up with new email
- [ ] Confirm email (if enabled)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password (should fail)
- [ ] Sign out
- [ ] Request password reset
- [ ] Reset password via email link
- [ ] Sign in with new password
- [ ] Access protected routes (history)
- [ ] Session persists after page reload

### Test Accounts

For development, you can disable email confirmation and create test accounts directly.

## 🔐 Best Practices

1. **Never** store passwords in plain text
2. **Always** use HTTPS in production
3. **Enable** email confirmation for production
4. **Rotate** API keys periodically
5. **Monitor** authentication logs
6. **Implement** rate limiting (Supabase handles this)
7. **Use** strong password requirements
8. **Test** all auth flows thoroughly

## 📝 Notes

- Service role key is used only in Edge Functions (server-side)
- Anon key is safe to expose in frontend
- RLS policies protect all user data
- Sessions are automatically refreshed
- Email templates can be customized
- Multi-factor authentication available (Supabase feature)

## 🎯 Production Checklist

Before deploying to production:

- [ ] Enable email confirmations
- [ ] Customize email templates
- [ ] Configure redirect URLs
- [ ] Test all authentication flows
- [ ] Enable rate limiting (if needed)
- [ ] Monitor authentication logs
- [ ] Document password policy for users
- [ ] Set up error monitoring (Sentry, etc.)

---

**Your complete user management system is ready!** 🎉

Users can now:
- Create accounts
- Sign in/out
- Reset passwords
- Save scenarios
- Manage their data securely

