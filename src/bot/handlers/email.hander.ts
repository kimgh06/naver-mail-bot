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
    // const access = await fetch(`https://auth.worksmobile.com/oauth2/v2.0/authorize?client_id=${process.env}&redirect_uri=${Redirect_URL}&scope=${Scope}&response_type=code&state=${state}&nonce={nonce}`)
    // console.log(access)
    // const data = await fetch(`${url}/users/${email}/mail/unread-count`,
    //   { headers: { 'Authorization': `Bearer ${access}` } })
    // console.log(data);
    this.email = newemail;
    const inter = setInterval(async () => {
      await message.channel.send(`${this.email} ${author}`);
      if (this.email !== newemail) {
        clearInterval(inter)
      }
    }, 1000);
  }
}