/*
  Warnings:

  - Added the required column `level` to the `users_skills_tran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users_skills_tran" ADD COLUMN     "level" VARCHAR(255) NOT NULL;
