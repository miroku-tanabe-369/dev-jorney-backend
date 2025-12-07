/*
  Warnings:

  - You are about to drop the column `s3_object_key` on the `users_mst` table. All the data in the column will be lost.
  - Added the required column `quest_order` to the `quest_mst` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quest_mst" ADD COLUMN     "quest_order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users_mst" DROP COLUMN "s3_object_key",
ADD COLUMN     "icon" VARCHAR(255);
