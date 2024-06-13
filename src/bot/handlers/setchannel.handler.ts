import { Message } from "discord.js";
import { MessageHandler } from "../bot.decorator";
import { BaseHandler } from "./base.handler";

@MessageHandler('/setchannel')
export class ChannelHandler extends BaseHandler {
  async process(message: Message, args: string[]) {
    await message.reply("Channel sets");
    return message.channelId;
  }
}