/*
  Warnings:

  - You are about to drop the `managed_checklist_tran` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "managed_checklist_tran" DROP CONSTRAINT "managed_checklist_tran_quest_code_fkey";

-- DropForeignKey
ALTER TABLE "managed_checklist_tran" DROP CONSTRAINT "managed_checklist_tran_user_id_fkey";

-- DropTable
DROP TABLE "managed_checklist_tran";
