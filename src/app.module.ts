import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SurahModule } from './quran/surah.module';
import { SearchModule } from './search/search.module';
import { PrismaService } from './prisma.service';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [SurahModule, SearchModule, AudioModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
