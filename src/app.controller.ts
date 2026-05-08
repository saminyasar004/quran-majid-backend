import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status: 200,
      message: 'Server is running.',
    };
  }
}
