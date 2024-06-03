import { Message } from 'discord.js';

export abstract class BaseHandler {
  abstract process(message: Message, args: string[]): void;
}