import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SurahService } from './surah.service';
import { SurahDto, SurahDetailDto } from './dto/quran.dto';

@ApiTags('quran')
@Controller('surahs')
export class SurahController {
  constructor(private readonly surahService: SurahService) {}

  @Get()
  @ApiOperation({ summary: 'Get all 114 Surahs', description: 'Returns a list of all chapters in the Quran with their metadata.' })
  @ApiResponse({ status: 200, description: 'Return all surahs.', type: [SurahDto] })
  async findAll() {
    return this.surahService.findAll();
  }

  @Get(':number')
  @ApiOperation({ summary: 'Get a specific Surah by number', description: 'Returns a single chapter with all its verses (ayahs).' })
  @ApiParam({ name: 'number', description: 'The number of the surah (1-114)', example: 1 })
  @ApiQuery({ name: 'audio', required: false, type: Boolean, description: 'Whether to include audio URLs from alquran.cloud' })
  @ApiResponse({ status: 200, description: 'Return the specific surah.', type: SurahDetailDto })
  @ApiResponse({ status: 404, description: 'Surah not found.' })
  async findOne(
    @Param('number', ParseIntPipe) number: number,
    @Query('audio') audio?: string,
  ) {
    const includeAudio = audio === 'true';
    return this.surahService.findOne(number, includeAudio);
  }
}
