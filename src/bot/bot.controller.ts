import { Controller, Get, Req } from '@nestjs/common';
import { BotService } from './bot.service';
import { Request } from 'express';
import { Message, TextChannel } from 'discord.js';
import { OAuth2Client } from 'google-auth-library';
import { gmail_v1 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

@Controller('')
export class BotController {
  constructor(private readonly botService: BotService) { }

  @Get('')
  async verifying(@Req() req: Request) {
    const code: string = this.botService.getQueries(req);
    const message: Message = this.botService.getMessages();
    const channel: TextChannel = this.botService.getChannel();
    const auth: OAuth2Client = this.botService.getAuth();
    const { tokens } = await auth.getToken(code);
    await this.botService.setCredentials(tokens);
    const email: gmail_v1.Gmail = this.botService.getEmail();
    const id: string = this.botService.getId();
    const userId: string = this.botService.getUserId();
    let origincnt: number = 1;

    await channel.send(`\n\n${id}로 연결 됨`);
    const inter = setInterval(async () => {
      if (id !== this.botService.getId()) {
        clearInterval(inter)
      }
      let next: string | undefined;
      let messages: gmail_v1.Schema$Message[] = [];
      let cnt: number = 0;
      do {
        const mails = await email.users.messages.list({
          userId: id, q: 'is:unread', pageToken: next, maxResults: 500
        })
        messages.push(...mails.data.messages || []);
        next = mails.data.nextPageToken || undefined;
        cnt += mails.data.resultSizeEstimate || 0;
      } while (next)

      if (origincnt !== cnt) {
        if (origincnt < cnt) {
          await channel.send(`\n<@${userId}>\n${id}에서 읽지 않은 메일: ${cnt}`);
          let list: string[] = [];
          for (let m of messages) {
            const data: GaxiosResponse<gmail_v1.Schema$Message> = await email.users.messages.get({
              userId: id,
              id: m.id!
            })
            let subject = data.data.payload?.headers?.filter(e => e.name === 'Subject' && e)[0].value;
            let from = data.data.payload?.headers?.filter(e => e.name === 'From' && e)[0].value;
            list.push(`${from}: ${subject}`);
          }
          await channel.send(list.toString().replace(/,/g, '\n\n'));
        }
        if (cnt === 0) {
          await channel.send(`\n\n${id}의 메일을 다 읽음.`);
        }
        origincnt = cnt;
      }
    }, 2000);
  }
}
