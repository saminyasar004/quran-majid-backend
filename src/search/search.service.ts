import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    const [surahs, ayahs] = await Promise.all([
      // Search Surahs
      this.prisma.surah.findMany({
        where: {
          OR: [
            { nameEnglish: { contains: query, mode: 'insensitive' } },
            { nameArabic: { contains: query } },
            { nameTranslation: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { number: 'asc' },
        take: 10,
      }),
      // Search Ayahs
      this.prisma.ayah.findMany({
        where: {
          OR: [
            { textEnglish: { contains: query, mode: 'insensitive' } },
            { textArabic: { contains: query } },
          ],
        },
        include: {
          surah: true,
        },
        orderBy: { number: 'asc' },
        take: 50,
      }),
    ]);

    return { surahs, ayahs };
  }
}
