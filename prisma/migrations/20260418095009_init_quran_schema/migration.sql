-- CreateTable
CREATE TABLE "Surah" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "nameArabic" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "nameTranslation" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalVerses" INTEGER NOT NULL,

    CONSTRAINT "Surah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ayah" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "numberInSurah" INTEGER NOT NULL,
    "juz" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "hizb" INTEGER NOT NULL,
    "sajda" BOOLEAN NOT NULL DEFAULT false,
    "textArabic" TEXT NOT NULL,
    "textEnglish" TEXT NOT NULL,
    "surahId" INTEGER NOT NULL,

    CONSTRAINT "Ayah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Surah_number_key" ON "Surah"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Ayah_number_key" ON "Ayah"("number");

-- CreateIndex
CREATE INDEX "Ayah_textEnglish_idx" ON "Ayah"("textEnglish");

-- CreateIndex
CREATE INDEX "Ayah_textArabic_idx" ON "Ayah"("textArabic");

-- AddForeignKey
ALTER TABLE "Ayah" ADD CONSTRAINT "Ayah_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "Surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
