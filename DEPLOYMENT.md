# Deployment Guide - Railway

This guide will help you deploy the PR Dashboard SaaS to Railway.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub OAuth App configured
3. Stripe account with products/prices created
4. Resend account for email notifications

## Step 1: Set up Railway Project

1. Create a new project on Railway
2. Add PostgreSQL addon:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

## Step 2: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# App URL (use your Railway domain)
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Node Environment
NODE_ENV=production
```

## Step 3: Deploy Application

1. Connect your GitHub repository to Railway
2. Railway will auto-detect Next.js and deploy
3. Or use Railway CLI:
   ```bash
   railway login
   railway link
   railway up
   ```

## Step 4: Run Database Migrations

After first deployment, run Prisma migrations:

```bash
railway run pnpm prisma migrate deploy
```

Or use Railway CLI:
```bash
railway run npx prisma migrate deploy
```

## Step 5: Configure GitHub OAuth Callback

Update your GitHub OAuth App settings:
- Homepage URL: `https://your-app.up.railway.app`
- Authorization callback URL: `https://your-app.up.railway.app/api/auth/callback`

## Step 6: Configure Stripe Webhook

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-app.up.railway.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in Railway

## Step 7: Custom Domain (Optional)

1. In Railway project settings, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update GitHub OAuth App callback URL
6. Update Stripe webhook URL

## Database Management

### Run migrations
```bash
railway run npx prisma migrate deploy
```

### Access Prisma Studio
```bash
railway run npx prisma studio
```

### Seed database (if needed)
```bash
railway run npx prisma db seed
```

## Monitoring

- View logs in Railway dashboard
- Set up error tracking with Sentry (optional)
- Monitor database performance in Railway PostgreSQL metrics

## Scaling

Railway automatically scales based on traffic. For production:
- Consider upgrading to Railway Pro for better resources
- Monitor database connections (Prisma connection pooling is configured)
- Add Redis for caching GitHub API responses (future enhancement)

## Troubleshooting

### Build fails
- Check Node version compatibility (18.17+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Database connection issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL addon is running
- Run migrations: `railway run npx prisma migrate deploy`

### OAuth not working
- Verify callback URL matches exactly
- Check `NEXT_PUBLIC_APP_URL` is correct
- Ensure GitHub OAuth App is active

### Stripe webhooks failing
- Verify webhook secret is correct
- Check webhook URL is accessible
- Review Stripe webhook logs for errors

