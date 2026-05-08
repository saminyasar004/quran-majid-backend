import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseSqlValues(line: string): any[] | null {
  const match = line.match(/^\((.*)\)[,;]?$/);
  if (!match) return null;
  
  const rawValues = match[1];
  const values: any[] = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < rawValues.length; i++) {
    const char = rawValues[i];
    if (escape) {
      current += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === "'") {
      inString = !inString;
      // current += char; // Keep quotes for now or strip them? Strip them.
      continue;
    }
    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  
  return values.map(v => {
      if (v === 'NULL') return null;
      if (v === '0') return 0;
      if (v === '1') return 1;
      const num = Number(v);
      return isNaN(num) ? v : num;
  });
}

async function main() {
  const sqlFilePath = path.resolve(__dirname, '../../quran.sql');
  console.log(`Reading SQL file from: ${sqlFilePath}`);

  const surahs: any[] = [];
  const ayahs: Map<number, any> = new Map();
  const englishTranslations: Map<number, string> = new Map();

  const fileStream = fs.createReadStream(sqlFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentTable = '';
  let totalLines = 0;

  console.log('Starting to parse SQL file...');

  for await (const line of rl) {
    totalLines++;
    if (totalLines % 100000 === 0) console.log(`Processed ${totalLines} lines...`);

    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.startsWith('INSERT INTO `surahs`')) {
      currentTable = 'surahs';
      continue;
    } else if (trimmedLine.startsWith('INSERT INTO `ayahs`')) {
      currentTable = 'ayahs';
      continue;
    } else if (trimmedLine.startsWith('INSERT INTO `ayah_edition`')) {
      currentTable = 'ayah_edition';
      continue;
    } else if (trimmedLine.startsWith('(')) {
      const values = parseSqlValues(trimmedLine);
      if (!values) continue;

      if (currentTable === 'surahs') {
        // (id, number, name_ar, name_en, name_en_translation, type, ...)
        surahs.push({
          id: values[0],
          number: values[1],
          nameArabic: values[2],
          nameEnglish: values[3],
          nameTranslation: values[4],
          type: values[5],
          totalVerses: 0 // Will calculate
        });
      } else if (currentTable === 'ayahs') {
        // (id, number, text, number_in_surah, page, surah_id, hizb_id, juz_id, sajda, ...)
        ayahs.set(values[0], {
          id: values[0],
          number: values[1],
          textArabic: values[2],
          numberInSurah: values[3],
          page: values[4],
          surahId: values[5],
          hizb: values[6],
          juz: values[7],
          sajda: values[8] === 1,
          textEnglish: '' // Placeholder
        });
      } else if (currentTable === 'ayah_edition') {
        // (id, ayah_id, edition_id, data, ...)
        // Edition 20 is Sahih International
        if (values[2] === 20) {
          englishTranslations.set(values[1], values[3]);
        }
      }
    } else if (trimmedLine.endsWith(';')) {
        // currentTable = ''; // End of insert
    }
  }

  console.log(`Parsed ${surahs.length} Surahs, ${ayahs.size} Ayahs, and ${englishTranslations.size} translations.`);

  // Merge translations
  for (const [ayahId, translation] of englishTranslations) {
    const ayah = ayahs.get(ayahId);
    if (ayah) {
      ayah.textEnglish = translation;
    }
  }

  // Calculate total verses for each surah
  const surahVerseCount = new Map();
  for (const ayah of ayahs.values()) {
    surahVerseCount.set(ayah.surahId, (surahVerseCount.get(ayah.surahId) || 0) + 1);
  }

  for (const surah of surahs) {
    surah.totalVerses = surahVerseCount.get(surah.id) || 0;
  }

  console.log('Cleaning existing data...');
  await prisma.ayah.deleteMany();
  await prisma.surah.deleteMany();

  console.log('Seeding Surahs...');
  // Ensure unique surahs by number
  const uniqueSurahs = new Map();
  for (const s of surahs) {
    uniqueSurahs.set(s.number, s);
  }
  
  const surahData: any[] = Array.from(uniqueSurahs.values()).map(s => ({
    id: Number(s.id),
    number: Number(s.number),
    nameArabic: String(s.nameArabic),
    nameEnglish: String(s.nameEnglish),
    nameTranslation: String(s.nameTranslation),
    type: String(s.type),
    totalVerses: Number(s.totalVerses)
  }));

  try {
    console.log(`Attempting to seed ${surahData.length} Surahs...`);
    await prisma.surah.createMany({
      data: surahData
    });
    console.log('Surahs seeded successfully.');
  } catch (err: any) {
    console.error('Error seeding Surahs:');
    console.error(JSON.stringify(err, null, 2));
    if (err.cause) console.error('Extracted Cause:', JSON.stringify(err.cause, null, 2));
    throw err;
  }

  console.log('Seeding Ayahs...');
  const ayahsArray: any[] = Array.from(ayahs.values()).map(a => ({
    id: Number(a.id),
    number: Number(a.number),
    numberInSurah: Number(a.numberInSurah),
    juz: Number(a.juz),
    page: Number(a.page),
    hizb: Number(a.hizb),
    sajda: Boolean(a.sajda),
    textArabic: String(a.textArabic),
    textEnglish: String(a.textEnglish || ''),
    surahId: Number(a.surahId)
  }));

  // Filter ayahs that have a valid surahId to avoid P2003
  const validSurahIds = new Set(surahData.map(s => s.id));
  const filteredAyahsArray = ayahsArray.filter(a => {
    if (!validSurahIds.has(a.surahId)) {
        // console.warn(`Ayah ${a.id} refers to non-existent Surah ${a.surahId}`);
        return false;
    }
    return true;
  });

  if (filteredAyahsArray.length !== ayahsArray.length) {
    console.warn(`Filtered out ${ayahsArray.length - filteredAyahsArray.length} ayahs with invalid surahId.`);
  }

  // Batch insert Ayahs to avoid limits
  const batchSize = 500;
  for (let i = 0; i < filteredAyahsArray.length; i += batchSize) {
    const batch = filteredAyahsArray.slice(i, i + batchSize);
    try {
      await prisma.ayah.createMany({ data: batch });
      console.log(`Inserted ${i + batch.length} ayahs...`);
    } catch (err) {
      console.error(`Error in batch ${i}:`, err);
      throw err;
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
