import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AudioService } from './audio.service';

@ApiTags('audio')
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get('ayah/:number')
  @ApiOperation({ summary: 'Get audio URL for a specific Ayah', description: 'Returns the audio URL from alquran.cloud for a specific global ayah number.' })
  @ApiParam({ name: 'number', description: 'The global number of the ayah (1-6236)', example: 1 })
  @ApiQuery({ name: 'reciter', required: false, description: 'The reciter identifier (default: ar.alafasy)', example: 'ar.alafasy' })
  @ApiResponse({ status: 200, description: 'Return the audio URL.' })
  @ApiResponse({ status: 404, description: 'Ayah not found or audio unavailable.' })
  async getAyahAudio(
    @Param('number', ParseIntPipe) number: number,
    @Query('reciter') reciter?: string,
  ) {
    const audioUrl = await this.audioService.getAyahAudio(number, reciter);
    return { audioUrl };
  }

  @Get('surah/:number')
  @ApiOperation({ summary: 'Get all audio URLs for a specific Surah', description: 'Returns a list of audio URLs for all ayahs in a surah.' })
  @ApiParam({ name: 'number', description: 'The number of the surah (1-114)', example: 1 })
  @ApiQuery({ name: 'reciter', required: false, description: 'The reciter identifier (default: ar.alafasy)', example: 'ar.alafasy' })
  @ApiResponse({ status: 200, description: 'Return the list of audio URLs.' })
  async getSurahAudio(
    @Param('number', ParseIntPipe) number: number,
    @Query('reciter') reciter?: string,
  ) {
    return this.audioService.getSurahAudio(number, reciter);
  }

  @Get('editions')
  @ApiOperation({ summary: 'List all available editions', description: 'Returns a list of all available editions on alquran.cloud. Can be filtered by format, language, and type.' })
  @ApiQuery({ name: 'format', required: false, description: 'Filter by format (e.g. audio, text)', example: 'audio' })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language (e.g. en, ar)', example: 'en' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (e.g. versebyverse, translation)', example: 'versebyverse' })
  @ApiResponse({ status: 200, description: 'Return the list of editions.' })
  async getEditions(
    @Query('format') format?: string,
    @Query('language') language?: string,
    @Query('type') type?: string,
  ) {
    return this.audioService.getEditions(format, language, type);
  }

  @Get('languages')
  @ApiOperation({ summary: 'List all available languages', description: 'Returns a list of all languages in which editions are available.' })
  @ApiResponse({ status: 200, description: 'Return the list of languages.' })
  async getLanguages() {
    return this.audioService.getLanguages();
  }

  @Get('types')
  @ApiOperation({ summary: 'List all edition types', description: 'Returns all available types of editions (e.g. translation, tafsir, quran).' })
  @ApiResponse({ status: 200, description: 'Return the list of types.' })
  async getTypes() {
    return this.audioService.getTypes();
  }

  @Get('formats')
  @ApiOperation({ summary: 'List all edition formats', description: 'Returns all available formats (e.g. audio, text).' })
  @ApiResponse({ status: 200, description: 'Return the list of formats.' })
  async getFormats() {
    return this.audioService.getFormats();
  }
}
