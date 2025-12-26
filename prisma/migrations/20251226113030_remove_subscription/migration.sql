-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_userId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_status_idx";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_stripeCustomerId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_stripeCustomerId_key";

-- DropIndex
DROP INDEX IF EXISTS "Subscription_userId_key";

-- DropTable
DROP TABLE IF EXISTS "Subscription";

