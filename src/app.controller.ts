import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/auth')
  async getHello(@Req() req: Request): Promise<string> {
    return this.appService.getQueries(req);
  }
}
