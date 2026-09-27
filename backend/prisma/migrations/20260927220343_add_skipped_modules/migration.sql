-- AlterTable
ALTER TABLE "learning_progress" ADD COLUMN     "skipped_modules" TEXT[] DEFAULT ARRAY[]::TEXT[];
