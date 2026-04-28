# Integration Guide for the External Admin Panel (Gemini AI)

Hello Gemini! If you are working on the **Admin Guide Panel** (`adm-urbano.onrender.com`), here is the integration documentation to connect with the **Local Guide Prospector App**, identify Free Tier profiles, and correctly edit users.

## 1. Database Schema Changes (IMPORTANT 🛑)

A recent database migration dropped the `plan` column from both `User` and `GuideProfile` to normalize subscriptions. 
**If you are encountering errors like `The column 'User.plan' does not exist in the current database`**, it is because the schema has changed!

Instead of accessing `user.plan`, you must use the `Subscription` and `Plan` models that relate to `GuideProfile`.

## 2. API Endpoints Available for Admin Panel

We have explicitly exposed two REST API endpoints on this app to make your life easier and avoid direct Prisma access issues.

### `GET /api/admin/guides`
Returns a list of all local guides, dynamically calculating if they are on a Free Tier.
- **Parameters (Optional):** `?status=PENDING` or `ACTIVE`
- **Response Format:**
  ```json
  {
    "success": true,
    "guides": [
      {
        "id": "guide-uuid",
        "userId": "user-uuid",
        "name": "Guia Name",
        "status": "APPROVED",
        "plan": "free",
        "isFreeTier": true, // <--- Recognizes if it's 100% attachment-based profile
        ...
      }
    ]
  }
  ```

### `PUT /api/admin/guides/[id]`
Allows you to update the profile and user status, including forcing a plan change (which manages the Subscription model correctly behind the scenes).
- **Body Example:**
  ```json
  {
    "status": "APPROVED",
    "plan": "PRO_PLAN_ID_OR_FREE_OR_ULTIMATE", 
    "bio": "New Bio",
    "rating": 5.0
  }
  ```

## 3. Configuring Free, PREMIUM, and ULTIMATE Tier Profiles

As requested, Local Guide accounts with NO active subscriptions or a plan named "Free" are restricted to the **"Plano Free" UI**.
If the profile has a "premium" plan, it will render a **PRO** layout without limits.
If the profile has an "ultimate" plan (`plan: "ultimate"`), it will render the **100% ULTIMATE Attachment-based layout** (which features a dynamic animated gradient, VIP badges, and unlimited items).

When building your admin dashboard screens, please use `isFreeTier` (returned by the GET endpoint) to display a "Free Tier" badge. If you need to force an upgrade to ULTIMATE from the admin panel, simply push `"plan": "ultimate"` to the `PUT /api/admin/guides/[id]` endpoint.

## CORS Configuration
These endpoints have `Access-Control-Allow-Origin: https://adm-urbano.onrender.com` explicitly configured! You can fetch them securely from your browser environment or backend on Render without facing CORS blockers.
