import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadMessageWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMessageDto,
    @Req() req,
  ) {

    if (!file) {
      throw new BadRequestException('file not exist!');
    }

    const senderId = req.user.userId;
    const fileUrl = `/uploads/messages/${file.filename}`;

    return this.messageService.sendMessage({
      ...body,
      senderId,
      fileUrl,
    });
  }


  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createMessage(@Body() body: CreateMessageDto, @Req() req) {
    const senderId = req.user.userId;
    return this.messageService.sendMessage({ ...body, senderId });
  }

  @Get('conversation/:userId')
  @HttpCode(HttpStatus.OK)
  getConversation(@Param('userId') userId: number, @Req() req) {
    const currentUserId = req.user.userId;
    return this.messageService.getConversation({
      userId: currentUserId,
      peerId: +userId,
    });
  }


  @Post(':id/read')
  markAsRead(@Param('id') id: number) {
    return this.messageService.markAsRead(+id);
  }
}
