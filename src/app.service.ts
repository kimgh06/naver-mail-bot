import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'querystring';

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
      const code = list['code'];
      const body = new URLSearchParams();
      body.append('code', code);
      body.append('client_id', process.env.NAVER_CLIENT as string);
      body.append('client_secret', process.env.NAVER_SECRET as string);
      body.append('grant_type', 'authorization_code');
      const data = await (await fetch(`https://auth.worksmobile.com/oauth2/v2.0/token`, {
        method: 'post',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
      })).json();
      console.log(data)
      return 'Hello World!';
    }
    catch (e) {
      console.log(e)
      return e;
    }
  }
}
