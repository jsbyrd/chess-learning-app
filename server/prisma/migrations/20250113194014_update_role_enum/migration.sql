/*
  Warnings:

  - The values [MakeMove,NameNotation] on the enum `Game` will be removed. If these variants are still used in the database, this will fail.
  - The values [User,Admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Game_new" AS ENUM ('MAKEMOVE', 'NAMENOTATION');
ALTER TABLE "Analytics" ALTER COLUMN "game" TYPE "Game_new" USING ("game"::text::"Game_new");
ALTER TYPE "Game" RENAME TO "Game_old";
ALTER TYPE "Game_new" RENAME TO "Game";
DROP TYPE "Game_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
