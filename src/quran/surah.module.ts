import { Module } from '@nestjs/common';
import { SurahController } from './surah.controller';
import { SurahService } from './surah.service';
import { PrismaService } from '../prisma.service';
import { AudioModule } from '../audio/audio.module';

@Module({
  imports: [AudioModule],
  controllers: [SurahController],
  providers: [SurahService, PrismaService],
  exports: [SurahService],
})
export class SurahModule {}
