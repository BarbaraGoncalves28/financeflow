/*
  Warnings:

  - A unique constraint covering the columns `[invoiceItemId,installmentNumber]` on the table `Installment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Installment_invoiceItemId_key";

-- CreateIndex
CREATE INDEX "Installment_invoiceItemId_idx" ON "Installment"("invoiceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_invoiceItemId_installmentNumber_key" ON "Installment"("invoiceItemId", "installmentNumber");
