# GitHub PR Dashboard - SaaS

A production-ready SaaS application for managing GitHub pull requests across multiple repositories and organizations. Built with Next.js, PostgreSQL, Stripe, and deployed on Railway.

## Features

- 🎯 **Unified Dashboard** - View all PRs across multiple repos and orgs in one place
- ⚡ **Real-time Updates** - Automatic polling with configurable intervals
- 🔔 **Email Notifications** - Get notified about PR assignments and review requests
- 💳 **Stripe Billing** - Freemium model with Pro tier
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS
- 🔒 **Secure** - OAuth authentication with httpOnly cookies
- 📊 **PR Insights** - Track reviews, CI/CD status, and merge readiness

## Tech Stack

- **Frontend**: Next.js 16, React 19, TanStack Query, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: GitHub OAuth
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- pnpm (recommended) or npm
- PostgreSQL database
- GitHub OAuth App
- Stripe account (for billing)
- Resend account (for emails)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pr-dashboards
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials (see Configuration section below).

4. Set up the database:
```bash
pnpm prisma:migrate
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Configuration

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Configure:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Copy Client ID and Client Secret to `.env.local`

### Stripe Setup

1. Create products and prices in Stripe Dashboard
2. Copy Secret Key and Price IDs to `.env.local`
3. Set up webhook endpoint (see DEPLOYMENT.md)

### Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Get API key and add to `.env.local`
3. Configure FROM_EMAIL with your verified domain

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── v1/           # REST API endpoints
│   │   ├── auth/         # Authentication
│   │   └── webhooks/     # Stripe webhooks
│   └── (auth)/           # Auth pages
├── components/            # React components
│   ├── landing/          # Landing page components
│   ├── pr/              # PR-related components
│   ├── sidebar/         # Sidebar components
│   └── ui/              # UI primitives
├── contexts/             # React contexts
├── lib/                  # Utilities
│   ├── api/             # API client
│   └── hooks/           # React hooks
└── server/              # Server-side code
    ├── auth/            # Auth utilities
    ├── billing/         # Stripe integration
    ├── db/              # Database client
    ├── github/          # GitHub API service
    └── notifications/   # Email service
```

## API Endpoints

### User
- `GET /api/v1/user` - Get current user
- `PATCH /api/v1/user/preferences` - Update preferences

### Repositories
- `GET /api/v1/repos` - List user's repositories

### Pull Requests
- `GET /api/v1/prs?repos=owner/repo1,owner/repo2` - List PRs
- `GET /api/v1/prs/:owner/:repo/:number` - Get PR details
- `POST /api/v1/prs/:owner/:repo/:number/approve` - Approve PR
- `POST /api/v1/prs/:owner/:repo/:number/merge` - Merge PR

### Billing
- `POST /api/v1/billing/checkout` - Create checkout session
- `POST /api/v1/billing/portal` - Create portal session

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Railway.

Quick deploy:
```bash
railway login
railway init
railway add postgresql
railway up
railway run npx prisma migrate deploy
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm lint` - Run ESLint

## Pricing Tiers

### Free
- Up to 5 repositories
- 30s minimum polling
- Basic PR management

### Pro ($8/month)
- Unlimited repositories
- 10s minimum polling
- Email notifications
- Priority support

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway

### Prerequisites

1. A [Railway](https://railway.app) account
2. Your GitHub repository pushed to GitHub

### Deployment Steps

1. **Connect your repository to Railway:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Generate Public Domain (Get Your URL):**
   - In Railway, go to your service's **Settings** tab
   - Scroll down to the **Networking** section
   - Click **"Generate Domain"** or **"+ Public Domain"**
   - Railway will create a URL like `https://pr-dashboards-production-xxxx.up.railway.app`
   - **Copy this URL** - you'll need it for the next steps

3. **Set Environment Variables:**
   Railway will automatically detect Next.js, but you need to set these environment variables in Railway's dashboard:
   
   ```
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
   NEXT_PUBLIC_APP_URL=https://your-actual-railway-url.up.railway.app
   ```
   
   **Important:** Replace `https://your-actual-railway-url.up.railway.app` with the actual URL you generated in step 2.

4. **Update GitHub OAuth App:**
   - Go to your GitHub OAuth App settings
   - Update the **Homepage URL** to: `https://your-actual-railway-url.up.railway.app`
   - Update the **Authorization callback URL** to: `https://your-actual-railway-url.up.railway.app/api/auth/callback`
   - Save the changes

5. **Deploy:**
   - Railway will automatically build and deploy your app
   - The build process will run `pnpm install` and `pnpm build`
   - Once deployed, your app will be available at the Railway-provided URL
   - If you see "Unexposed service", make sure you've generated a public domain in step 2

### Railway Configuration

The project includes:
- `railway.json` - Railway deployment configuration (uses Railpack builder)

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Yes |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Same as GITHUB_CLIENT_ID (for client-side) | Yes |
| `NEXT_PUBLIC_APP_URL` | Your Railway app URL (e.g., `https://your-app.up.railway.app`) | Yes |
| `GITHUB_TOKEN` | Optional: For GraphQL codegen (not needed in production) | No |

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
