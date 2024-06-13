import { BaseHandler } from './base.handler';
import { MessageHandler } from '../bot.decorator';
import { Message } from 'discord.js';
import { gmail_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

type processReturnType = {
  oAuth2Client: OAuth2Client,
  email: gmail_v1.Gmail,
  id: string,
  userId: string
}

@MessageHandler('/setemail')
export class EmailHandler extends BaseHandler {
  private email: gmail_v1.Gmail;
  private oAuth2Client: OAuth2Client;
  private id: string;
  private message: Message;
  private userId: string;
  async getEmails() {
    const res = await this.email.users.messages.list({ userId: this.id });
    return res.data
  }

  async getMessage() {
    return this.message;
  }

  async process(message: Message, args: string[]): Promise<processReturnType> {
    this.message = message;
    const newemail = args[0];
    const author = this.message.author.displayName
    this.userId = this.message.author.id;
    this.id = newemail;
    // try {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT as string,
      process.env.GMAIL_SECRET as string,
      process.env.REDIRECT as string
    );
    this.email = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    const url = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    })
    await this.message.channel.send(`${url}`);
    await this.message.channel.send(`${this.id} ${author} registered`);
    return { oAuth2Client: this.oAuth2Client, email: this.email, id: this.id, userId: this.userId };
  }
}