# Website Integration Guide for External Subscription Management

## Overview

Your mobile app is now configured for **external subscription management** via your website. This setup allows you to:
- Publish as a **FREE app** on Apple App Store & Google Play
- Handle all payments through your website's payment gateway
- Automatically unlock app features when users subscribe on your website
- Comply with Apple Reader App guidelines (3.1.3b) and Google Play policies

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Mobile App    │
│   (Free)        │
└────────┬────────┘
         │
         │ JWT Token Auth
         │ Subscription Status Checks
         │
┌────────▼────────┐
│   Your Backend  │
│   (tRPC API)    │
└────────┬────────┘
         │
         │ Webhook Updates
         │
┌────────▼────────┐
│  Your Website   │
│  (Wix/Custom)   │
└────────┬────────┘
         │
         │ Payment Processing
         │
┌────────▼────────┐
│ Payment Gateway │
│ (Stripe, etc)   │
└─────────────────┘
```

---

## 🔐 Security Implementation

### JWT Token Authentication

**Token Generation:**
- 30-day expiration
- Includes: `userId`, `email`
- Secret: `JWT_SECRET` (set in environment)

**Token Storage:**
- **iOS/Android:** Expo SecureStore (Keychain/EncryptedSharedPreferences)
- **Web:** AsyncStorage with in-memory global token

**Token Usage:**
- Automatically included in all API requests via tRPC headers
- Refreshed on sign-in/sign-up

---

## 📡 API Endpoints (Backend tRPC)

Your backend exposes these tRPC procedures:

### 1. **auth.signUp**
Creates new user account with FREE status by default.

**Input:**
```typescript
{
  email: string;
  password: string;
  displayName: string;
}
```

**Output:**
```typescript
{
  userId: string;
  email: string;
  displayName: string;
  token: string;  // JWT token
}
```

**Behavior:**
- Creates user in database
- Creates license with `subscriptionStatus: 'FREE'`
- Returns JWT token

---

### 2. **auth.signIn**
Authenticates user and returns current subscription status.

**Input:**
```typescript
{
  email: string;
  password: string;
}
```

**Output:**
```typescript
{
  userId: string;
  email: string;
  displayName: string;
  token: string;  // JWT token
}
```

---

### 3. **auth.getProfile** (Protected)
Returns user profile and current subscription status.

**Requires:** JWT token in Authorization header

**Output:**
```typescript
{
  userId: string;
  email: string;
  displayName: string;
  subscriptionStatus: 'FREE' | 'PREMIUM';
  deviceId?: string;
}
```

**Usage:**
- Called automatically on app launch
- Called when user taps "Restore Access"
- Auto-refetches when app comes to foreground

---

### 4. **auth.updateSubscriptionFromWebsite** (Webhook)
Updates user subscription status from your website.

**Input:**
```typescript
{
  userId: string;
  subscriptionStatus: 'FREE' | 'PREMIUM';
  webhookSecret: string;  // Must match WEBHOOK_SECRET env var
}
```

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Security:**
- Requires `webhookSecret` to prevent unauthorized updates
- Public endpoint (no JWT required) for webhook calls

---

## 🌐 Website Integration Steps

### Step 1: Set Up Environment Variables

Add to your backend `.env` or hosting environment:

```bash
# JWT Secret - Change this to a random secure string
JWT_SECRET=your_secure_random_jwt_secret_here

# Webhook Secret - Change this to a random secure string
WEBHOOK_SECRET=your_secure_webhook_secret_here
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 2: Website Authentication Flow

When user clicks "Manage Account" in the app:

1. **App opens:** `https://amehymnsapp.wixsite.com/account`
2. **Pass user token** (recommended method):
   ```
   https://amehymnsapp.wixsite.com/account?token=JWT_TOKEN_HERE
   ```
3. **Website validates token:**
   - Decode JWT using `JWT_SECRET`
   - Extract `userId` and `email`
   - Auto-login user or display account page

**Example JWT validation (Node.js):**
```javascript
const jwt = require('jsonwebtoken');

function validateAppToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    return null;
  }
}
```

---

### Step 3: Payment Processing

When user completes payment on your website:

1. Process payment via your gateway (Stripe, PayPal, etc)
2. After successful payment, update app subscription status
3. Call webhook to notify mobile backend

---

### Step 4: Webhook Implementation

After successful payment, call your backend webhook:

**Endpoint:**
```
POST https://your-backend-url.com/api/trpc/auth.updateSubscriptionFromWebsite
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user-id-from-token",
  "subscriptionStatus": "PREMIUM",
  "webhookSecret": "your_webhook_secret_here"
}
```

**Example (Node.js/Fetch):**
```javascript
async function updateAppSubscription(userId, status) {
  const response = await fetch(
    'https://your-backend-url.com/api/trpc/auth.updateSubscriptionFromWebsite',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        subscriptionStatus: status,
        webhookSecret: process.env.WEBHOOK_SECRET
      })
    }
  );
  
  return await response.json();
}

// After successful payment:
await updateAppSubscription(userId, 'PREMIUM');
```

**tRPC Mutation Format:**
```javascript
// If using tRPC client on website
const result = await trpcClient.auth.updateSubscriptionFromWebsite.mutate({
  userId: userId,
  subscriptionStatus: 'PREMIUM',
  webhookSecret: process.env.WEBHOOK_SECRET
});
```

---

### Step 5: App Unlocking Flow

After webhook call:

1. ✅ Backend updates user's subscription status to `PREMIUM`
2. ✅ User returns to mobile app
3. ✅ User taps "Restore Access" or app auto-refreshes
4. ✅ App calls `auth.getProfile` and receives `subscriptionStatus: 'PREMIUM'`
5. ✅ App unlocks all premium hymns automatically

---

## 🔄 Subscription Sync Behavior

The app automatically syncs subscription status in these scenarios:

| Event | Trigger | Behavior |
|-------|---------|----------|
| **App Launch** | User opens app | Auto-fetch subscription status |
| **Login** | User signs in | Fetch status after auth |
| **Return from Browser** | User returns from website | Auto-refresh on focus |
| **Manual Refresh** | User taps "Restore Access" | Force refresh status |

**Implementation:**
- Uses React Query with `refetchOnMount: true` and `refetchOnWindowFocus: true`
- Stores status locally for offline access
- Always validates server-side before granting access

---

## 🛡️ App Store Compliance

### ✅ Apple App Store (Reader App - 3.1.3b)

Your app complies with Apple guidelines:

- ✅ Published as **FREE** app
- ✅ No in-app purchases
- ✅ No pricing mentioned in app
- ✅ "Manage Account" button opens **external browser** (Safari)
- ✅ Content gating: FREE users see limited hymns (first 5)
- ✅ Subscription managed externally on your website

**What's allowed:**
- "Manage Account" button ✅
- "Restore Access" button ✅
- "Subscription Status" display ✅

**What's NOT allowed:**
- "Subscribe now" buttons ❌
- Pricing information ❌
- Payment form inside app ❌

---

### ✅ Google Play Store

Your app complies with Google Play policies:

- ✅ Published as **FREE** app
- ✅ Does not use Google Play Billing
- ✅ External link to website for subscription management
- ✅ Follows External Payment policy

---

## 🎨 User Experience Flow

### New User Journey:
1. Download app (FREE)
2. Sign up with email
3. Browse first 5 hymns (free preview)
4. Tap "Manage Account" → Opens website
5. Subscribe on website
6. Return to app → Tap "Restore Access"
7. Full access unlocked ✅

### Existing Premium User:
1. Sign in to app
2. App auto-detects PREMIUM status
3. All hymns unlocked immediately ✅

---

## 🧪 Testing Guide

### Test Scenario 1: New User Signup
```bash
1. Open app
2. Create account
3. Verify: Free status, only 5 hymns visible
4. Try accessing hymn #6 → Should show unlock prompt
```

### Test Scenario 2: Website Payment
```bash
1. Sign in to app
2. Tap "Manage Account"
3. Complete payment on website
4. Website calls webhook with PREMIUM status
5. Return to app
6. Tap "Restore Access"
7. Verify: All hymns unlocked
```

### Test Scenario 3: Token Security
```bash
1. Sign in to app
2. Check secure storage (iOS Keychain/Android Keychain)
3. Verify JWT token is stored securely
4. Sign out
5. Verify token is deleted
```

### Test Scenario 4: Offline Access
```bash
1. Sign in with PREMIUM account
2. App syncs status
3. Turn off internet
4. Verify: Premium access still works (cached status)
5. Turn on internet
6. Verify: Status syncs again
```

---

## 🚨 Error Handling

### Common Issues & Solutions

**Issue:** User paid but app still shows FREE
**Solution:** 
1. Check webhook was called successfully
2. Verify `webhookSecret` matches
3. Have user tap "Restore Access"
4. Check backend logs for errors

**Issue:** JWT token expired
**Solution:**
- User needs to sign in again (30-day expiration)
- Token auto-refreshes on sign-in

**Issue:** "Invalid webhook secret" error
**Solution:**
- Verify `WEBHOOK_SECRET` env variable matches in both website and backend

**Issue:** Device already activated on another device
**Solution:**
- Current implementation allows one device per premium account
- User needs to sign out from old device or contact support

---

## 📊 Database Schema

Your backend uses in-memory storage (can be migrated to real DB):

### Users Table
```typescript
{
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  googleId?: string;
}
```

### Licenses Table
```typescript
{
  userId: string;
  subscriptionStatus: 'FREE' | 'PREMIUM';
  deviceId?: string;
  activatedAt?: Date;
  purchaseToken?: string;
}
```

---

## 🔮 Future Enhancements (Optional)

### Multi-tier Plans
Add new subscription levels:
```typescript
type SubscriptionStatus = 'FREE' | 'BASIC' | 'PREMIUM' | 'FAMILY';
```

### Promo Codes
Add endpoint:
```typescript
auth.redeemPromoCode: {
  input: { code: string },
  output: { subscriptionStatus: SubscriptionStatus }
}
```

### Subscription Expiry
Add fields to License:
```typescript
{
  expiresAt?: Date;
  gracePeriodEndsAt?: Date;
}
```

### Family Sharing
Add fields to License:
```typescript
{
  familyGroupId?: string;
  maxDevices: number;
}
```

---

## 📞 Support & Troubleshooting

### Debug Mode

Enable detailed logging by checking browser/native console:
- `[Auth] Sign in failed:` - Authentication errors
- `[App] Syncing subscription status:` - Subscription updates
- `[tRPC] Fetching:` - API calls

### Webhook Testing

Test webhook locally:
```bash
curl -X POST http://localhost:3000/api/trpc/auth.updateSubscriptionFromWebsite \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "subscriptionStatus": "PREMIUM",
    "webhookSecret": "your_webhook_secret"
  }'
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Change `JWT_SECRET` to secure random value
- [ ] Change `WEBHOOK_SECRET` to secure random value
- [ ] Update website URL in settings.tsx (line 26)
- [ ] Test complete payment flow end-to-end
- [ ] Verify tokens stored securely on iOS/Android
- [ ] Test "Restore Access" button
- [ ] Verify no pricing/subscribe buttons in app
- [ ] Test free preview limits (5 hymns)
- [ ] Submit to App Store as FREE app
- [ ] Submit to Google Play as FREE app

---

## 📋 Quick Reference

### Key Files Modified:
- `backend/trpc/routes/auth.ts` - Auth routes + webhook
- `contexts/auth-context.tsx` - JWT token management
- `contexts/app-context.tsx` - Subscription sync
- `app/settings.tsx` - Restore Access UI

### Environment Variables Needed:
```bash
JWT_SECRET=<random_32_char_string>
WEBHOOK_SECRET=<random_32_char_string>
```

### Website Webhook URL:
```
POST /api/trpc/auth.updateSubscriptionFromWebsite
```

### App Store Links:
- Manage Account: `https://amehymnsapp.wixsite.com/account`

---

## 🎯 Summary

Your app is now fully configured for external subscription management. Users can:

1. ✅ Download FREE app from stores
2. ✅ Sign up/in with email
3. ✅ Preview 5 hymns for free
4. ✅ Visit website to subscribe
5. ✅ Automatically unlock premium content
6. ✅ Restore access on new devices

The implementation is:
- 🔐 **Secure** - JWT tokens, encrypted storage, webhook secrets
- 📱 **Native** - iOS Keychain, Android EncryptedSharedPreferences
- 🌐 **Web-compatible** - Fallback to AsyncStorage
- ✅ **Compliant** - Apple Reader App + Google Play policies
- 🔄 **Real-time** - Auto-sync on login, resume, manual refresh

Next step: Integrate webhook into your website's payment success handler!
