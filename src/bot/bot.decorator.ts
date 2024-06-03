import { SetMetadata } from '@nestjs/common';
import { MESSAGE_HANDLER_METADATA_KEY } from './bot.constant';

export const MessageHandler = (message: string) => {
  return SetMetadata(MESSAGE_HANDLER_METADATA_KEY, message);
};