import { Controller, Get, Req } from '@nestjs/common';
import { BotService } from './bot.service';
import { Request } from 'express';
import { Message } from 'discord.js';
import { OAuth2Client } from 'google-auth-library';

@Controller('')
export class BotController {
  constructor(private readonly botService: BotService) { }

  @Get('')
  async verifying(@Req() req: Request) {
    const code = this.botService.getQueries(req);
    const message: Message = this.botService.getMessages();
    const auth: OAuth2Client = this.botService.getAuth();
    const { tokens } = await auth.getToken(code);
    await this.botService.setCredentials(tokens);
    const email = this.botService.getEmail();
    const id = this.botService.getId();
    const userId = this.botService.getUserId();
    let origincnt: number = 0;

    const inter = setInterval(async () => {
      if (id !== this.botService.getId()) {
        clearInterval(inter)
      }
      let next: string | undefined;
      let messages = [];
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
        origincnt = cnt;
        await message.channel.send(`\n<@${userId}>\n${id}에서 읽지 않은 메일: ${cnt}`)
        let list = [];
        for (let m of messages) {
          const data = await email.users.messages.get({
            userId: id,
            id: m.id!
          })
          let subject = data.data.payload?.headers?.filter(e => e.name === 'Subject' && e)[0].value
          let from = data.data.payload?.headers?.filter(e => e.name === 'From' && e)[0].value
          list.push(`${from}: ${subject}`)
        }
        await message.channel.send(list.toString().replace(/,/g, '\n'));
      }
    }, 2000);
  }
}
