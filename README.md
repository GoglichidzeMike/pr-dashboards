# GitHub PR Dashboard

A Next.js application for managing GitHub pull requests with real-time updates, advanced filtering, and comprehensive PR information display.

## Getting Started

### Prerequisites

- Node.js 18.12 or higher
- pnpm (or npm/yarn)
- GitHub OAuth App credentials

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Application URL (used for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: GitHub Token for development/testing (for GraphQL codegen)
GITHUB_TOKEN=your_github_token_here
```

### Setting up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: GitHub PR Dashboard (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Add these to your `.env.local` file

### Installation

Install dependencies:

```bash
pnpm install
```

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
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
