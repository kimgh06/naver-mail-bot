import { BaseHandler } from './base.handler';
import { MessageHandler } from '../bot.decorator';
import { Message } from 'discord.js';

@MessageHandler('/setemail')
export class EmailHandler extends BaseHandler {
  private email: string = '';
  async process(message: Message, args: string[]) {
    const url = process.env.NAVER_API_URL;
    const newemail = args[0];
    const author = message.author.displayName
    const acc_url = `https://auth.worksmobile.com/oauth2/v2.0/authorize?client_id=${process.env.NAVER_CLIENT}&redirect_uri=${process.env.REDIRECT}&scope=email&response_type=code&state=UmyR2sX9gO`
    await message.channel.send(`vertify to ${acc_url}`);
    // const data = await fetch(`${url}/users/${email}/mail/unread-count`,
    //   { headers: { 'Authorization': `Bearer ${access}` } })
    // console.log(data);
    this.email = newemail;
    const inter = setInterval(async () => {
      await message.channel.send(`${this.email} ${author}`);
      clearInterval(inter)
      if (this.email !== newemail) {
      }
    }, 1000);
  }
}