# User Authentication API Documentation

This document provides comprehensive documentation for the User Authentication API system, including mock implementation, TypeScript API clients, and React hooks.

## Overview

The User Authentication API provides a foundational authentication system supporting:
- User registration
- User login
- Profile retrieval with favorites

This is currently a **mock implementation** integrated into the Vite development server for testing and development purposes.

---

## API Endpoints

### 1. POST /api/auth/register

**Description**: Creates a new user account and returns an authentication token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Success Response** (200):
```json
{
  "status": "Success",
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "user-1234567890-abc123",
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Error Responses**:
- **400 Bad Request**: Missing required fields
  ```json
  {
    "status": "Failed",
    "message": "email, password, and name are required"
  }
  ```
- **409 Conflict**: User already exists
  ```json
  {
    "status": "Failed",
    "message": "User with this email already exists"
  }
  ```

---

### 2. POST /api/auth/login

**Description**: Authenticates an existing user and returns an authentication token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200):
```json
{
  "status": "Success",
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "user-1234567890-abc123",
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Error Responses**:
- **400 Bad Request**: Missing required fields
  ```json
  {
    "status": "Failed",
    "message": "email and password are required"
  }
  ```
- **401 Unauthorized**: Invalid credentials
  ```json
  {
    "status": "Failed",
    "message": "Invalid email or password"
  }
  ```

---

### 3. GET /api/user/profile

**Description**: Retrieves the authenticated user's profile and favorite restaurants.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "status": "Success",
  "user_id": "user-1234567890-abc123",
  "name": "John Doe",
  "email": "user@example.com",
  "favorite_restaurant_ids": [
    "noodles-0-annaba",
    "vegetarian-2-annaba"
  ]
}
```

**Error Responses**:
- **401 Unauthorized**: Invalid or missing token
  ```json
  {
    "status": "Failed",
    "message": "Unauthorized - invalid or missing auth token"
  }
  ```
- **404 Not Found**: User not found
  ```json
  {
    "status": "Failed",
    "message": "User not found"
  }
  ```

---

## TypeScript API Client

### Import

```typescript
import {
  registerUser,
  loginUser,
  getUserProfile,
  registerAndStoreAuth,
  loginAndStoreAuth,
  logout,
  getStoredAuthToken,
  validateAuthToken
} from '@/lib/api/auth';
```

### Basic Usage Examples

#### 1. Register a New User

```typescript
try {
  const response = await registerUser({
    email: "newuser@example.com",
    password: "securePassword123",
    name: "Jane Smith"
  });

  console.log(`Welcome ${response.name}!`);
  console.log(`Auth Token: ${response.auth_token}`);

  // Store token for future requests
  localStorage.setItem('creao_auth_token', response.auth_token);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### 2. Login Existing User

```typescript
try {
  const response = await loginUser({
    email: "user@example.com",
    password: "securePassword123"
  });

  console.log(`Welcome back ${response.name}!`);
  localStorage.setItem('creao_auth_token', response.auth_token);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### 3. Get User Profile

```typescript
const token = localStorage.getItem('creao_auth_token');

if (token) {
  try {
    const profile = await getUserProfile(token);

    console.log(`User: ${profile.name}`);
    console.log(`Email: ${profile.email}`);
    console.log(`Favorites: ${profile.favorite_restaurant_ids.length} restaurants`);
  } catch (error) {
    console.error('Failed to fetch profile:', error.message);
    // Token might be invalid, redirect to login
  }
}
```

#### 4. Helper Functions

```typescript
// Register and automatically store token
const user = await registerAndStoreAuth({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});
// Token is now in localStorage

// Login and automatically store token
const user = await loginAndStoreAuth({
  email: "user@example.com",
  password: "password123"
});

// Validate stored token
const token = getStoredAuthToken();
const isValid = await validateAuthToken(token);
if (!isValid) {
  // Redirect to login
}

// Logout (clear token)
logout();
```

---

## React Hooks

The authentication system includes powerful React hooks with TanStack Query integration for caching, loading states, and optimistic updates.

### Import

```typescript
import {
  useUserProfile,
  useRegister,
  useLogin,
  useAuthManager,
  useAuthState,
  AUTH_QUERY_KEYS
} from '@/hooks/use-auth-api';
```

### Hook Examples

#### 1. useUserProfile

Fetch and cache the authenticated user's profile.

```typescript
function UserProfile() {
  const token = localStorage.getItem('creao_auth_token');
  const { data, isLoading, error, refetch } = useUserProfile(token || '');

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Not authenticated</div>;

  return (
    <div>
      <h2>Welcome, {data.name}!</h2>
      <p>Email: {data.email}</p>
      <p>Favorites: {data.favorite_restaurant_ids.length}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

#### 2. useRegister

Register a new user with loading and error states.

```typescript
function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { mutate, isPending, error } = useRegister({
    onSuccess: (data) => {
      console.log('Registration successful!', data);
      localStorage.setItem('creao_auth_token', data.auth_token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Registration failed:', error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password, name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        required
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Registering...' : 'Register'}
      </button>
      {error && <p className="error">Error: {error.message}</p>}
    </form>
  );
}
```

#### 3. useLogin

Login a user with loading and error states.

```typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending, error } = useLogin({
    onSuccess: (data) => {
      console.log('Login successful!', data);
      localStorage.setItem('creao_auth_token', data.auth_token);
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">Error: {error.message}</p>}
    </form>
  );
}
```

#### 4. useAuthManager

Complete authentication manager with all features combined.

```typescript
function Dashboard() {
  const [token, setToken] = useState(localStorage.getItem('creao_auth_token'));

  const {
    profile,
    isLoadingProfile,
    register,
    login,
    logout,
    isAuthenticated,
    isLoading
  } = useAuthManager(token);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('creao_auth_token');
    setToken(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {profile?.name}!</p>
      <p>Email: {profile?.email}</p>
      <p>Favorites: {profile?.favorite_restaurant_ids.length}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

#### 5. useAuthState

Simplified auth state management with automatic localStorage sync.

```typescript
function App() {
  const {
    authToken,
    profile,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    loginError,
    registerError
  } = useAuthState();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(email, password) => login({ email, password })}
        onRegister={(email, password, name) => register({ email, password, name })}
        loginError={loginError}
        registerError={registerError}
      />
    );
  }

  return (
    <Dashboard
      user={profile}
      onLogout={logout}
    />
  );
}
```

---

## Mock Implementation Details

### Location

The mock API is implemented in `/config/vite/mock-api-plugin.mjs` as a Vite middleware plugin.

### Features

1. **In-Memory Storage**: User data is stored in memory (not persisted between server restarts)
2. **Mock JWT Tokens**: Generates Base64-encoded JWT-like tokens with expiration
3. **Password Storage**: Passwords are stored in plain text (mock only - never do this in production!)
4. **Token Validation**: Validates token format and expiration
5. **Auto-Initialization**: Each new user gets an empty favorites list

### Mock JWT Format

```
header.payload.signature

header = base64({ alg: "HS256", typ: "JWT" })
payload = base64({ userId: "...", exp: timestamp, iat: timestamp })
signature = base64("mock-signature-{userId}")
```

### Integration with Favorites API

When a user registers or logs in, an empty favorites set is automatically created. The `/api/user/profile` endpoint returns the user's `favorite_restaurant_ids` list, which integrates with the existing Favorites API.

---

## Error Handling

### Client-Side Error Handling

```typescript
try {
  const response = await loginUser({ email, password });
  // Success
} catch (error) {
  if (error.message.includes('Invalid email or password')) {
    // Show login error
  } else if (error.message.includes('required')) {
    // Show validation error
  } else {
    // Show generic error
  }
}
```

### React Hook Error Handling

```typescript
const { mutate, error } = useLogin({
  onError: (error) => {
    if (error.message.includes('Invalid')) {
      toast.error('Invalid credentials');
    } else {
      toast.error('Login failed. Please try again.');
    }
  }
});
```

---

## Migration to Production

To migrate from the mock implementation to a real backend:

1. **Keep the TypeScript types and React hooks** - they're production-ready
2. **Update the API base URL** in environment variables:
   ```
   VITE_API_BASE_PATH=https://api.yourapp.com
   ```
3. **Remove the mock plugin** from `vite.config.js`
4. **Implement real backend endpoints** matching the API contract
5. **Add proper security**:
   - Hash passwords (bcrypt, Argon2)
   - Use real JWT signing (with secret key)
   - Add HTTPS/TLS
   - Implement rate limiting
   - Add CSRF protection

---

## Testing

### Manual Testing (Development)

1. Start the dev server: `npm run dev`
2. Use the browser console or API testing tools

**Register a user**:
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  })
});
const data = await response.json();
console.log(data);
```

**Login**:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});
const data = await response.json();
console.log(data);
```

**Get Profile**:
```javascript
const token = 'YOUR_AUTH_TOKEN_HERE';
const response = await fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log(data);
```

---

## Security Considerations

**IMPORTANT**: This is a MOCK implementation for development only!

**Production Requirements**:
- Never store passwords in plain text
- Use secure password hashing (bcrypt, Argon2)
- Implement proper JWT signing with secret keys
- Use HTTPS for all API calls
- Add rate limiting to prevent brute force attacks
- Implement proper session management
- Add CSRF protection
- Validate and sanitize all inputs
- Use secure cookie settings for tokens
- Implement proper logout (token invalidation)
- Add account lockout after failed login attempts

---

## Support

For questions or issues with the authentication system:
- Check the TypeScript types in `/src/lib/api/auth.ts`
- Review the mock implementation in `/config/vite/mock-api-plugin.mjs`
- See usage examples in this README
