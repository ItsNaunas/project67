# 🔒 Security Implementation Guide

## Overview

This project follows security-first principles adapted from App Router best practices for Pages Router architecture.

---

## 🛡️ Security Layers

### 1. Middleware Protection (Route-Level)

**File**: `middleware.ts`

Uses **allow-list pattern** to protect routes:

```typescript
// Protected routes require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/generate', 
  '/tabs',
  '/checkout',
  '/success'
]
```

**How it works**:
- Checks Supabase session for protected routes
- Redirects unauthenticated users to homepage
- Runs on every request (Edge Runtime)

---

### 2. API Route Security

**Pattern**: Every API route follows this structure:

```typescript
// Step 1: Validate Input (Zod)
const input = validateInput(Schema, req.body)

// Step 2: Authenticate User
const user = await requireUser(req)

// Step 3: Verify Ownership
await requireOwnership(user.id, resource.user_id)

// Step 4: Business Logic
// ... perform operation

// Step 5: Return Safe Response
return successResponse(data, res)
```

**Files**:
- `lib/server/auth.ts` - Authentication utilities
- `lib/server/validation.ts` - Input validation schemas
- `lib/server/errors.ts` - Error handling

---

### 3. Input Validation (Zod)

**All API inputs MUST be validated**:

```typescript
// Define schema
const Schema = z.object({
  dashboardId: z.string().uuid(),
  type: z.enum(['business_case', 'content_strategy'])
})

// Validate (throws ZodError if invalid)
const input = validateInput(Schema, req.body)
```

**Benefits**:
- Runtime type checking
- Automatic error messages
- Prevents injection attacks
- Type inference for TypeScript

---

## 📋 Security Checklist

### For Every API Route:

- [ ] **Method Check**: Only allow intended HTTP methods
- [ ] **Input Validation**: Use Zod schemas (no raw `req.body`)
- [ ] **Authentication**: Call `requireUser(req)`
- [ ] **Authorization**: Verify ownership with `requireOwnership()`
- [ ] **Error Handling**: Use `handleApiError()` (never leak stack traces)
- [ ] **Response**: Use `successResponse()` (only send safe data)

### For Every Page:

- [ ] **Protected Routes**: Add to `PROTECTED_ROUTES` in middleware
- [ ] **Client Auth**: Use `useSession()` hook
- [ ] **Loading States**: Handle `!session` case
- [ ] **Redirects**: Redirect unauthenticated users

### For Database Operations:

- [ ] **RLS Enabled**: All tables have Row Level Security
- [ ] **Service Role**: Only use in API routes (never client-side)
- [ ] **Ownership Check**: Verify user owns data before returning
- [ ] **Minimal Data**: Only return fields client needs

---

## 🚨 Common Vulnerabilities PREVENTED

### 1. ✅ Authorization Bypass
**Prevented by**: Ownership verification

```typescript
// ❌ BAD: Trust dashboardId from client
const dashboard = await supabase
  .from('dashboards')
  .select('*')
  .eq('id', dashboardId)
  .single()

// ✅ GOOD: Verify user owns it
await requireOwnership(user.id, dashboard.user_id)
```

### 2. ✅ Injection Attacks
**Prevented by**: Zod validation

```typescript
// ❌ BAD: Use raw input
const { dashboardId } = req.body // Could be anything!

// ✅ GOOD: Validate input
const input = validateInput(Schema, req.body) // Throws if invalid
```

### 3. ✅ Information Leakage
**Prevented by**: Centralized error handling

```typescript
// ❌ BAD: Leak error details
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack })
}

// ✅ GOOD: Safe error response
catch (error) {
  return handleApiError(error, res) // Hides sensitive info in prod
}
```

### 4. ✅ Unauthorized Access
**Prevented by**: Middleware + API auth checks

```typescript
// Middleware blocks unauthenticated requests to /dashboard
// API routes double-check with requireUser(req)
```

---

## 📝 Examples

### Secure API Route Example

```typescript
// pages/api/delete-dashboard.ts
import { requireUser, requireOwnership, getSupabaseAdmin } from '@/lib/server/auth'
import { validateInput } from '@/lib/server/validation'
import { handleApiError, successResponse } from '@/lib/server/errors'
import { z } from 'zod'

const DeleteSchema = z.object({
  dashboardId: z.string().uuid()
})

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Validate
    const input = validateInput(DeleteSchema, req.body)

    // 2. Authenticate
    const user = await requireUser(req)

    // 3. Get resource
    const supabase = getSupabaseAdmin()
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('user_id')
      .eq('id', input.dashboardId)
      .single()

    if (!dashboard) {
      return res.status(404).json({ error: 'Not found' })
    }

    // 4. Authorize
    await requireOwnership(user.id, dashboard.user_id)

    // 5. Delete
    await supabase
      .from('dashboards')
      .delete()
      .eq('id', input.dashboardId)

    // 6. Respond
    return successResponse({ deleted: true }, res)
    
  } catch (error) {
    return handleApiError(error, res)
  }
}
```

---

## 🔧 How to Add New API Routes

1. **Create validation schema** in `lib/server/validation.ts`
2. **Use the template** above
3. **Test with invalid inputs** to ensure validation works
4. **Test without auth** to ensure requireUser() blocks
5. **Test with wrong user** to ensure ownership check works

---

## ⚠️ NEVER Do This

```typescript
// ❌ NEVER trust client-provided user IDs
const { userId } = req.body
await supabase.from('profiles').select('*').eq('id', userId)

// ❌ NEVER use service role key client-side
// (It's in lib/server/ for a reason!)

// ❌ NEVER return full database records
return res.json(dashboard) // Might contain sensitive fields

// ❌ NEVER skip validation
const { dashboardId } = req.body // No validation!

// ❌ NEVER leak error details in production
return res.json({ error: error.stack })
```

---

## 🎯 Applied to Project 67

### Hardened Routes:

✅ **`/api/generate`** - Full security implementation
- Input validation (dashboardId, type)
- User authentication
- Ownership verification
- Limit enforcement
- Safe error handling

### Next to Harden:

- `pages/api/create-checkout-session.ts`
- `pages/api/buy-credits.ts`
- `pages/api/send-notification.ts`

---

## 📚 References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Documentation](https://zod.dev/)

---

## 🔄 Review Process

Before merging:

1. ✅ Build passes
2. ✅ All API routes use validation
3. ✅ No client imports of `lib/server/**`
4. ✅ Protected routes in middleware
5. ✅ Ownership checks on all resources
6. ✅ Error handling uses `handleApiError()`

---

**Status**: ✅ Security infrastructure implemented
**Next**: Apply pattern to remaining API routes

