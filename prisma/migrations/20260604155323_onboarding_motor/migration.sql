/*
  Warnings:

  - Added the required column `body_fat` to the `athlete_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ffmi` to the `athlete_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swr` to the `athlete_profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `experience_months` on table `athlete_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `athlete_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `athlete_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `squat_1rm` on table `athlete_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `press_1rm` on table `athlete_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deadlift_1rm` on table `athlete_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "athlete_profiles" ADD COLUMN     "body_fat" DECIMAL(4,2) NOT NULL,
ADD COLUMN     "ffmi" DECIMAL(4,2) NOT NULL,
ADD COLUMN     "swr" DECIMAL(4,2) NOT NULL,
ALTER COLUMN "experience_months" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "squat_1rm" SET NOT NULL,
ALTER COLUMN "press_1rm" SET NOT NULL,
ALTER COLUMN "deadlift_1rm" SET NOT NULL;
