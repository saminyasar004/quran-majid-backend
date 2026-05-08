import { ApiProperty } from '@nestjs/swagger';

export class AyahDto {
  @ApiProperty({ description: 'The absolute number of the verse in the Quran', example: 1 })
  number: number;

  @ApiProperty({ description: 'The number of the verse within the surah', example: 1 })
  numberInSurah: number;

  @ApiProperty({ description: 'The juz number', example: 1 })
  juz: number;

  @ApiProperty({ description: 'The page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'The original Arabic text of the verse', example: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' })
  textArabic: string;

  @ApiProperty({ description: 'The English translation of the verse', example: 'In the name of Allah, the Entirely Merciful, the Especially Merciful' })
  textEnglish: string;

  @ApiProperty({ description: 'The URL to the audio file for the verse', example: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3', required: false })
  audioUrl?: string;
}

export class SurahDto {
  @ApiProperty({ description: 'The number of the surah', example: 1 })
  number: number;

  @ApiProperty({ description: 'The Arabic name of the surah', example: 'سورة الفاتحة' })
  nameArabic: string;

  @ApiProperty({ description: 'English name of the surah', example: 'Al-Faatiha' })
  nameEnglish: string;

  @ApiProperty({ description: 'English translation of the surah name', example: 'The Opening' })
  nameTranslation: string;

  @ApiProperty({ description: 'Type of the surah (Meccan or Medinan)', example: 'Meccan' })
  type: string;

  @ApiProperty({ description: 'Total number of verses in the surah', example: 7 })
  totalVerses: number;
}

export class SurahDetailDto extends SurahDto {
  @ApiProperty({ type: [AyahDto], description: 'List of verses in the surah' })
  ayahs: AyahDto[];
}
