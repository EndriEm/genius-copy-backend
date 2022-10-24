/*
  Warnings:

  - You are about to drop the `_GenreToSong` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `genreId` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_GenreToSong_B_index";

-- DropIndex
DROP INDEX "_GenreToSong_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_GenreToSong";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "source" TEXT,
    "lyrics" TEXT,
    "liked" BOOLEAN,
    "genreId" INTEGER NOT NULL,
    CONSTRAINT "Song_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("id", "image", "liked", "lyrics", "source", "title") SELECT "id", "image", "liked", "lyrics", "source", "title" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
