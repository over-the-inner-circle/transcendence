import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ChatRoomCreationDto } from '../dto/chat-room-creation.dto';
import { ChatRoomJoinDto } from '../dto/chat-room-join.dto';
import { ChatRoomMessageDto } from '../dto/chat-room-message.dto';
import { ChatRoomPenaltyWithTimeDto } from '../dto/chat-room-penalty-with-time.dto';
import { ChatRoomSetPasswordDto } from '../dto/chat-room-set-password.dto';
import { ChatUserRoleDto } from '../dto/chat-user-role.dto';
import { AuthGuard } from '../../common/http/guard/auth.guard';
import { ChatRoomAccessibilityDto } from '../dto/chat-room-accessibility.dto';
import { ChatRoomUnpenalizeDto } from '../dto/chat-room-unpenalize.dto';
import {
  ChatRoomInviteByNicknameDto,
  ChatRoomInviteDto,
} from '../dto/chat-room-invite.dto';
import { ChatRoomPenaltyDto } from '../dto/chat-room-penalty.dto';
import { UserService } from '../../user/user.service';

//TODO: param uuid validation
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @Post('room')
  async createRoom(
    @Req() req,
    @Body() chatRoomCreationDto: ChatRoomCreationDto,
  ) {
    chatRoomCreationDto.room_owner_id = req.user.user_id;
    return this.chatService.createRoom(chatRoomCreationDto);
  }

  @Delete('room/:roomId')
  async deleteRoom(@Req() req, @Param('roomId', new ParseUUIDPipe()) roomId) {
    return this.chatService.deleteRoom({
      room_owner_id: req.user.user_id,
      room_id: roomId,
    });
  }

  @Get('room/:roomId/members')
  async getRoomMembers(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
  ) {
    return this.chatService.getRoomMembers({ room_id: roomId });
  }

  @Post('room/:roomId/join')
  async joinRoom(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomJoinDto: ChatRoomJoinDto,
  ) {
    chatRoomJoinDto.user_id = req.user.user_id;
    chatRoomJoinDto.room_id = roomId;
    return this.chatService.joinRoom(chatRoomJoinDto);
  }

  @Post('room/:roomId/exit')
  async exitRoom(@Req() req, @Param('roomId', new ParseUUIDPipe()) roomId) {
    return this.chatService.exitRoom({
      user_id: req.user.user_id,
      room_id: roomId,
    });
  }

  @Put('room/:roomId/password')
  async setRoomPassword(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomSetPasswordDto: ChatRoomSetPasswordDto,
  ) {
    chatRoomSetPasswordDto.room_owner_id = req.user.user_id;
    chatRoomSetPasswordDto.room_id = roomId;
    return this.chatService.setRoomPassword(chatRoomSetPasswordDto);
  }

  @Put('room/:roomId/role')
  async setRole(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatUserRoleDto: ChatUserRoleDto,
  ) {
    chatUserRoleDto.room_owner_id = req.user.user_id;
    chatUserRoleDto.room_id = roomId;
    return this.chatService.setRole(chatUserRoleDto);
  }

  @Post('room/:roomId/kick')
  async kickUser(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomPenaltyDto: ChatRoomPenaltyDto,
  ) {
    chatRoomPenaltyDto.room_admin_id = req.user.user_id;
    chatRoomPenaltyDto.room_id = roomId;
    return this.chatService.kickUser(chatRoomPenaltyDto);
  }

  @Post('room/:roomId/ban')
  async banUser(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomPenaltyWithTimeDto: ChatRoomPenaltyWithTimeDto,
  ) {
    chatRoomPenaltyWithTimeDto.room_admin_id = req.user.user_id;
    chatRoomPenaltyWithTimeDto.room_id = roomId;
    return this.chatService.banUser(chatRoomPenaltyWithTimeDto);
  }

  @Delete('room/:roomId/ban')
  async unbanUser(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomUnpenalizeDto: ChatRoomUnpenalizeDto,
  ) {
    chatRoomUnpenalizeDto.room_admin_id = req.user.user_id;
    chatRoomUnpenalizeDto.room_id = roomId;
    return this.chatService.unbanUser(chatRoomUnpenalizeDto);
  }

  @Get('room/:roomId/ban')
  async getBanList(@Req() req, @Param('roomId', new ParseUUIDPipe()) roomId) {
    return this.chatService.getBanList({
      room_admin_id: req.user.user_id,
      room_id: roomId,
    });
  }

  @Post('room/:roomId/mute')
  async muteUser(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() ChatRoomPenaltyWithTimeDto: ChatRoomPenaltyWithTimeDto,
  ) {
    ChatRoomPenaltyWithTimeDto.room_admin_id = req.user.user_id;
    ChatRoomPenaltyWithTimeDto.room_id = roomId;
    return this.chatService.muteUser(ChatRoomPenaltyWithTimeDto);
  }

  @Delete('room/:roomId/mute')
  async unmuteUser(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomUnpenalizeDto: ChatRoomUnpenalizeDto,
  ) {
    chatRoomUnpenalizeDto.room_admin_id = req.user.user_id;
    chatRoomUnpenalizeDto.room_id = roomId;
    return this.chatService.unmuteUser(chatRoomUnpenalizeDto);
  }

  @Get('room/:roomId/mute')
  async getMuteList(@Req() req, @Param('roomId', new ParseUUIDPipe()) roomId) {
    return this.chatService.getMuteList({
      room_admin_id: req.user.user_id,
      room_id: roomId,
    });
  }

  @Post('room/:roomId/message')
  async storeMessage(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomMessageDto: ChatRoomMessageDto,
  ) {
    chatRoomMessageDto.room_id = roomId;
    return this.chatService.storeRoomMessage(chatRoomMessageDto);
  }

  @Get('room/:roomId/messages')
  async getAllMessages(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
  ) {
    return this.chatService.getAllRoomMessages({
      user_id: req.user.user_id,
      room_id: roomId,
    });
  }

  @Put('room/:roomId/access')
  async setRoomAccessibility(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomAccessibilityDto: ChatRoomAccessibilityDto,
  ) {
    chatRoomAccessibilityDto.room_owner_id = req.user.user_id;
    chatRoomAccessibilityDto.room_id = roomId;
    return this.chatService.setRoomAccessibility(chatRoomAccessibilityDto);
  }

  @Post('room/:roomId/invite')
  async inviteUser(
    @Req() req,
    @Param('roomId', new ParseUUIDPipe()) roomId,
    @Body() chatRoomInviteByNicknameDto: ChatRoomInviteByNicknameDto,
  ) {
    const { user_id: receiver_id } = await this.userService.getUserByNickname(
      chatRoomInviteByNicknameDto.receiver_nickname,
    );
    const chatRoomInviteDto: ChatRoomInviteDto = {
      user_id: req.user.user_id,
      room_id: roomId,
      receiver_id,
    };
    return this.chatService.inviteUser(chatRoomInviteDto);
  }

  @Get('rooms')
  async searchRooms(@Req() req, @Query('room-name') roomName: string) {
    return this.chatService.searchRooms(roomName);
  }

  @Get('rooms/all')
  async searchAllRooms(@Req() req) {
    return this.chatService.searchAllRooms();
  }

  @Get('rooms/joined')
  async getJoinedRooms(@Req() req) {
    return this.chatService.getJoinedRooms(req.user.user_id);
  }
}
