import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';
import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { BaseHandler } from './handlers/base.handler';
import { MESSAGE_HANDLER_METADATA_KEY } from './bot.constant';
import { Request } from 'express';
import { OAuth2Client, Credentials } from 'google-auth-library';
import { gmail_v1 } from 'googleapis';
import { channel } from 'diagnostics_channel';

type processReturnType = {
  oAuth2Client: OAuth2Client,
  email: gmail_v1.Gmail,
  id: string,
  userId: string
}

@Injectable()
export class BotService implements OnModuleInit {
  private instanceByMessage: { [message: string]: BaseHandler };
  private logger = new Logger(BotService.name);
  private message: Message;
  private auth: OAuth2Client;
  private access: string;
  private refresh: string;
  private expire: Date;
  private email: gmail_v1.Gmail;
  private id: string;
  private userId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) { }

  onModuleInit() {
    this.discoveryHandlers();
    this.setupDiscordBot();
  }

  getEmail(): gmail_v1.Gmail {
    return this.email;
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getAccess(): string {
    return this.access;
  }

  getRefresh(): string {
    return this.refresh;
  }

  getExpire(): number {
    return this.expire.getTime();
  }

  setExpire(expire: Date): void {
    this.expire = expire
  }

  setAccess(access: string): void {
    this.access = access;
  }

  setRefresh(refresh: string): void {
    this.refresh = refresh
  }

  getMessages(): Message {
    return this.message;
  }

  getAuth(): OAuth2Client {
    return this.auth;
  }

  async setCredentials(tokens: Credentials) {
    this.auth.setCredentials(tokens);
  }

  getQueries(req: Request): string {
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
      return list['code'];
    }
    catch (e) {
      this.logger.error(e)
      return e;
    }
  }
  private discoveryHandlers() {
    this.instanceByMessage = this.discoveryService
      .getProviders()
      .reduce<{ [message: string]: BaseHandler }>(
        (acc, { metatype, instance }) => {
          if (!metatype) {
            return acc;
          }

          const metadata = Reflect.getMetadata(
            MESSAGE_HANDLER_METADATA_KEY,
            metatype,
          );
          if (!metadata) {
            return acc;
          }

          acc[metadata] = instance;

          return acc;
        },
        {},
      );
  }

  private setupDiscordBot() {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    client.on('messageCreate', async (message) => {
      this.message = message;
      if (this.message.author.bot) {
        return;
      }

      let args = this.message.content.trim().split(/ +/g);
      const route = args[0];
      args.shift();
      const foundInstance = this.instanceByMessage[route];
      if (foundInstance) {
        const data: any = await foundInstance.process(this.message, args);
        if (route === '/setemail' && data) {
          const { oAuth2Client, email, id, userId }: processReturnType = data;
          this.auth = oAuth2Client;
          this.email = email;
          this.id = id;
          this.userId = userId
        }
        return;
      }

      this.logger.log(`No message handler found for "${this.message.content}"`);
      (client.channels.cache.get('1246972112166584361') as TextChannel).send(`no message`);
    });
    client.on('ready', (client) => {
      this.logger.log('Bot is listening...');
      const channel = '1246972112166584361';
      (client.channels.cache.get(channel) as TextChannel).send(`${channel}`);
    });
    void client.login(this.configService.get<string>('DISCORD_TOKEN'));
  }
}