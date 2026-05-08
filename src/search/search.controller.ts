import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Get()
  @ApiOperation({ summary: 'Search Quran by Surah name or Ayah text', description: 'Search across all Surahs (names) and Ayahs (text) using matching on both English and Arabic fields.' })
  @ApiQuery({ name: 'q', description: 'The search query (e.g., "Cow", "Baqara", or "mercy")', example: 'mercy' })
  @ApiResponse({ status: 200, description: 'Return matching surahs and ayahs.' })
  async search(@Query('q') q: string) {
    return this.searchService.search(q);
  }
}
