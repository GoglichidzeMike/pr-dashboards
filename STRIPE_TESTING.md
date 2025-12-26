# Stripe Testing Guide

## Setup Steps

### 1. Create a Product in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/products
2. **Make sure you're in Test Mode** (toggle in top right corner)
3. Click "Add product" or "Create product"
4. Fill in:
   - **Name**: Pro Plan
   - **Description**: Unlimited repos, fast polling, email notifications
   - **Pricing model**: Standard pricing
   - **Price**: $8.00 USD
   - **Billing period**: Monthly (Recurring)
5. Click "Save product"
6. Copy the **Price ID** (starts with `price_...`)
7. Add it to your `.env.local`:
   ```
   STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
   ```

### 2. Verify Your Environment Variables

Make sure your `.env.local` has:
```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Optional for local testing

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Restart Your Dev Server

```bash
pnpm dev
```

## Testing the Checkout Flow

### Step 1: Navigate to Landing Page
1. Go to http://localhost:3000
2. You should see the landing page with pricing

### Step 2: Login
1. Click "Get Started" or navigate to http://localhost:3000/login
2. Login with your GitHub account

### Step 3: Trigger Checkout
1. Go back to http://localhost:3000 (you'll see the dashboard)
2. Or scroll to the pricing section on the landing page
3. Click "Upgrade to Pro" button
4. You should be redirected to Stripe Checkout page

### Step 4: Complete Test Payment
Use these test card details:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Cards:**
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`
- Insufficient Funds: `4000 0000 0000 9995`

Full list: https://stripe.com/docs/testing#cards

### Step 5: Verify Success
After completing payment:
1. You'll be redirected back to `http://localhost:3000/?checkout=success`
2. Check Stripe Dashboard → Customers (Test Mode) to see the new customer
3. Check Stripe Dashboard → Payments to see the payment

## Testing Webhooks Locally (Optional)

Webhooks won't work locally by default. To test them:

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other platforms: https://stripe.com/docs/stripe-cli
```

### Login to Stripe CLI
```bash
stripe login
```

### Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret (starts with `whsec_`). Add it to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Test the Webhook
In another terminal, trigger a test event:
```bash
stripe trigger checkout.session.completed
```

### Verify Webhook in Database
```bash
pnpm prisma:studio
```

Check the `Subscription` table to see if the subscription was created/updated.

## Troubleshooting

### "Invalid plan" error
- Make sure `STRIPE_PRO_PRICE_ID` is set in `.env.local`
- Restart your dev server after adding the variable

### "Unauthorized" error
- Make sure you're logged in with GitHub
- Check that your session is valid

### Redirect to dashboard instead of Stripe
- Check browser console for errors
- Verify the UpgradeButton component is being used
- Check that the API endpoint is responding correctly

### Webhook not working
- Make sure Stripe CLI is running with `stripe listen`
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Look for webhook events in Stripe Dashboard → Developers → Webhooks

### Database not updating after payment
- Webhooks need to be set up (see above)
- Check webhook logs in Stripe Dashboard
- Check your server logs for errors

## Production Deployment

When deploying to production:

1. Switch to **Live Mode** in Stripe Dashboard
2. Create the same product in Live Mode
3. Update environment variables with live keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PRO_PRICE_ID=price_...` (live price ID)
4. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Update `STRIPE_WEBHOOK_SECRET` with the production webhook secret

## Next Steps

After successful testing:
- [ ] Test the customer portal (`/api/v1/billing/portal`)
- [ ] Add subscription status display in dashboard
- [ ] Implement feature limits based on subscription
- [ ] Add "Manage Subscription" button for Pro users
- [ ] Test subscription cancellation flow

