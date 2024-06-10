import { Get, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { BaseHandler } from './handlers/base.handler';
import { MESSAGE_HANDLER_METADATA_KEY } from './bot.constant';
import { EmailHandler } from './handlers/email.handler';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
  imports: [ConfigModule.forRoot(), DiscoveryModule],
  providers: [EmailHandler, BotService],
  controllers: [BotController],
})
export class BotModule { }