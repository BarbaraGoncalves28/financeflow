/*
  Warnings:

  - The `status` column on the `CreditCardPurchase` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CreditCardPurchaseStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "CreditCardPurchase" DROP COLUMN "status",
ADD COLUMN     "status" "CreditCardPurchaseStatus" NOT NULL DEFAULT 'COMPLETED';
