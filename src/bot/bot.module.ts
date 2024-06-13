import { Get, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { BaseHandler } from './handlers/base.handler';
import { MESSAGE_HANDLER_METADATA_KEY } from './bot.constant';
import { EmailHandler } from './handlers/setemail.handler';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { ChannelHandler } from './handlers/setchannel.handler';

@Module({
  imports: [ConfigModule.forRoot(), DiscoveryModule],
  providers: [EmailHandler, ChannelHandler, BotService],
  controllers: [BotController],
})
export class BotModule { }