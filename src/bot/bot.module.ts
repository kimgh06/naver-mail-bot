import { Get, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { BaseHandler } from './handlers/base.handler';
import { MESSAGE_HANDLER_METADATA_KEY } from './bot.constant';
import { EmailHandler } from './handlers/email.handler';

@Module({
  imports: [ConfigModule.forRoot(), DiscoveryModule],
  providers: [EmailHandler],
})
export class BotModule implements OnModuleInit {
  private instanceByMessage: { [message: string]: BaseHandler };
  private logger = new Logger();
  private message: Message;

  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) { }

  onModuleInit() {
    this.discoveryHandlers();
    this.setupDiscordBot();
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
      this.message = message
      if (this.message.author.bot) {
        return;
      }

      let args = this.message.content.trim().split(/ +/g);
      const route = args[0]
      args.shift();
      const foundInstance = this.instanceByMessage[route];
      if (foundInstance) {
        foundInstance.process(this.message, args);
        return;
      }

      this.logger.log(`No message handler found for "${this.message.content}"`);
    });
    client.on('ready', () => {
      this.logger.log('Bot is listening...');
    });
    void client.login(this.configService.get<string>('DISCORD_TOKEN'));
  }
}