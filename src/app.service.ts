import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'querystring';
import { EmailHandler } from './bot/handlers/email.handler';

@Injectable()
export class AppService {
  async getQueries(req: Request): Promise<string> {
    let queries: string | string[] = decodeURIComponent(req.url.split('?')[1])
    if (!queries) {
      return 'no';
    }
    queries = queries.split('&');
    let list: { [key: string]: string } = {};
    queries.forEach(element => {
      const key = element.split('=')[0];
      list[key as string] = element.split(key + '=')[1];
    });
    try {
      // const message = EmailHandler.get
      console.log(list)
      return 'Hello World!';
    }
    catch (e) {
      console.log(e)
      return e;
    }
  }
}
