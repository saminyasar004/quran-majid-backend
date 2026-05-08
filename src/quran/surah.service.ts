import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class SurahService {
  constructor(
    private prisma: PrismaService,
    private audioService: AudioService,
  ) {}

  async findAll() {
    return this.prisma.surah.findMany({
      orderBy: { number: 'asc' },
    });
  }

  async findOne(number: number, includeAudio = false) {
    const surah = await this.prisma.surah.findUnique({
      where: { number },
      include: { ayahs: { orderBy: { numberInSurah: 'asc' } } },
    });

    if (!surah) {
      throw new NotFoundException(`Surah with number ${number} not found`);
    }

    if (includeAudio) {
      const audioData = await this.audioService.getSurahAudio(number);
      const audioMap = new Map(audioData.map((a) => [a.number, a.audio]));
      
      return {
        ...surah,
        ayahs: surah.ayahs.map((ayah) => ({
          ...ayah,
          audioUrl: (audioMap.get(ayah.number) as string) || null,
        })),
      };
    }

    return surah;
  }
}
