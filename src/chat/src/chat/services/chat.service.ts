import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  LessThanOrEqual,
  Like,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { ChatRoomMessage } from '../../common/entities/chat-room-message.entity';
import {
  ChatRoom,
  ChatRoomAccess,
} from '../../common/entities/chat-room.entity';
import { ChatRoomUser } from '../../common/entities/chat-room-user.entity';
import { ChatRoomPenaltyWithTimeDto } from '../dto/chat-room-penalty-with-time.dto';
import { ChatRoomJoinDto } from '../dto/chat-room-join.dto';
import { ChatRoomCreationDto } from '../dto/chat-room-creation.dto';
import { ChatRoomMessageDto } from '../dto/chat-room-message.dto';
import { ChatUserRoleDto } from '../dto/chat-user-role.dto';
import { ChatRoomBanList } from '../../common/entities/chat-room-ban-list.entity';
import { ChatRoomMuteList } from '../../common/entities/chat-room-mute-list.entity';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { RmqError } from '../../common/rmq/types/rmq-error';
import { ChatRoomSetPasswordDto } from '../dto/chat-room-set-password.dto';
import { ChatRoomUserDto } from '../dto/chat-room-user.dto';
import { toRmqError } from '../../common/rmq/errors/to-rmq-error';
import { UserNotInScopeError } from '../../common/rmq/errors/user-not-in-scope.error';
import { OwnerPrivileageError } from '../../common/rmq/errors/owner-privileage.error';
import { ChatRoomSearchDto } from '../dto/chat-room-search.dto';
import { ChatRoomAccessibilityDto } from '../dto/chat-room-accessibility.dto';
import { ChatRoomUnpenalizeDto } from '../dto/chat-room-unpenalize.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RmqEvent } from '../../common/rmq/types/rmq-event';
import { BannedUserError } from '../../common/rmq/errors/banned-user.error';
import { MutedUserError } from '../../common/rmq/errors/muted-user.error';
import { InvalidPasswordError } from '../../common/rmq/errors/invalid-password.error';
import { ChatRoomEventType } from '../types/chat-event.type';
import { toUserProfile } from '../../common/utils/utils';
import { ChatAnnouncementFromServer } from '../types/chat-message-format';
import { ChatRoomInviteDto } from '../dto/chat-room-invite.dto';
import { UserProfile } from '../../user-info';
import { UserService } from '../../user/services/user.service';
import { ChatRoomPenaltyDto } from '../dto/chat-room-penalty.dto';
import { Cron } from '@nestjs/schedule';
import { SelfPenalizeError } from '../../common/rmq/errors/self-penalize-error.dto';

/*  TODO:
 *
 * distributed DB?
 * cron-job on ban/mute list?
 */

@Injectable()
export class ChatService {
  static readonly SALT = 10;

  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly dbConnection: DataSource,
    private readonly userService: UserService,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    @InjectRepository(ChatRoomMessage)
    private readonly chatRoomMessageRepo: Repository<ChatRoomMessage>,
    @InjectRepository(ChatRoomUser)
    private readonly chatRoomUserRepo: Repository<ChatRoomUser>,
    @InjectRepository(ChatRoomBanList)
    private readonly chatRoomBanListRepo: Repository<ChatRoomBanList>,
    @InjectRepository(ChatRoomMuteList)
    private readonly chatRoomMuteListRepo: Repository<ChatRoomMuteList>,
  ) {}

  chatTX() {
    return process.env.RMQ_CHAT_TOPIC;
  }

  roomTX() {
    return process.env.RMQ_CHAT_ROOM_TOPIC;
  }

  roomRK(eventName: string, roomId: string) {
    return `event.on.chat-room.${eventName}.${roomId}.rk`;
  }

  publishRoomEvent(
    roomId: string,
    evType: ChatRoomEventType,
    recvUsers: string[],
    payload: string,
  ) {
    const event: RmqEvent<ChatAnnouncementFromServer> = {
      recvUsers,
      data: { payload },
      created: new Date(),
    };
    this.amqpConnection.publish(
      this.roomTX(),
      this.roomRK(evType, roomId),
      event,
    );
  }

  publishChatEvent(evType: string, recvUsers: string[], data: any) {
    const event: RmqEvent = {
      recvUsers,
      data,
      created: new Date(),
    };
    this.amqpConnection.publish(
      this.chatTX(),
      `event.on.chat.${evType}.rk`,
      event,
    );
  }

  async findRoom(roomId: string) {
    const room = await this.chatRoomRepo.findOneBy({
      roomId,
    });
    return room;
  }

  async isOwner(userId, roomOrId: ChatRoom | string) {
    let room: ChatRoom;

    if (typeof roomOrId === 'string') room = await this.findRoom(roomOrId);
    else room = roomOrId;
    return room !== null && room.roomOwnerId === userId;
  }

  async isAdmin(userId, roomOrId: ChatRoom | string) {
    let room: ChatRoom;
    if (typeof roomOrId === 'string') room = await this.findRoom(roomOrId);
    else room = roomOrId;

    let userInRoom;
    if (room) {
      userInRoom = await this.chatRoomUserRepo.findOneBy({
        roomId: room.roomId,
        userId,
      });
    }
    return userInRoom !== null && userInRoom.role === 'admin';
  }

  async getMember(userId, roomOrId: ChatRoom | string) {
    let room: ChatRoom;
    if (typeof roomOrId === 'string') room = await this.findRoom(roomOrId);
    else room = roomOrId;

    let usersInRoom = null;
    if (room) {
      usersInRoom = await this.chatRoomUserRepo.find({
        where: {
          roomId: room.roomId,
          userId,
        },
        relations: ['user'],
      });
    }
    return usersInRoom !== null ? toUserProfile(usersInRoom[0].user) : null;
  }

  getExpiry(seconds) {
    return moment(Date.now()).add(seconds, 's').toDate();
  }

  async searchRooms(chatRoomSearchDto: ChatRoomSearchDto) {
    let rooms: ChatRoom[];
    try {
      rooms = await this.chatRoomRepo.findBy({
        roomAccess: Not(ChatRoomAccess.PRIVATE),
        roomName: Like(`%${chatRoomSearchDto.room_name}%`),
      });
    } catch (e) {
      throw toRmqError(e);
    }

    return {
      rooms: rooms.map((room) => {
        return {
          room_id: room.roomId,
          room_name: room.roomName,
          room_owner_id: room.roomOwnerId,
          room_access: room.roomAccess,
          created: room.created,
        };
      }),
    };
  }

  async searchAllRooms() {
    let rooms: ChatRoom[];
    try {
      rooms = await this.chatRoomRepo.findBy({
        roomAccess: Not(ChatRoomAccess.PRIVATE),
      });
    } catch (e) {
      throw toRmqError(e);
    }

    return {
      rooms: rooms.map((room) => {
        return {
          room_id: room.roomId,
          room_name: room.roomName,
          room_owner_id: room.roomOwnerId,
          room_access: room.roomAccess,
          created: room.created,
        };
      }),
    };
  }

  async getRoomMembers(room: ChatRoom) {
    const usersInRoom = await this.chatRoomUserRepo.find({
      where: {
        roomId: room.roomId,
      },
      relations: ['user'],
    });

    const userProfiles = usersInRoom.map((userInRoom) => {
      const userProfile = toUserProfile(userInRoom.user);
      if (room.roomOwnerId === userProfile.user_id) userInRoom.role = 'owner';

      userProfile['role'] = userInRoom.role;
      return userProfile;
    });
    return {
      members: userProfiles,
    };
  }

  async createRoom(chatRoomCreationDto: ChatRoomCreationDto) {
    const {
      room_name: roomName,
      room_owner_id: roomOwnerId,
      room_access: roomAccess,
      room_password: roomPassword,
    } = chatRoomCreationDto;

    if (roomAccess === 'protected') {
      if (!roomPassword)
        throw new RmqError({
          code: 400,
          message: `cannot create ${roomAccess} room without password`,
          where: 'chat-service',
        });
    } else {
      if (roomPassword)
        throw new RmqError({
          code: 400,
          message: `cannot create ${roomAccess} room with password`,
          where: 'chat-service',
        });
    }

    let hashedRoomPassword = null;
    if (roomPassword)
      hashedRoomPassword = bcrypt.hashSync(roomPassword, ChatService.SALT);

    let roomId;
    const q = this.dbConnection.createQueryRunner();
    q.startTransaction();
    try {
      const roomResult = await q.manager.insert(ChatRoom, {
        roomName,
        roomOwnerId,
        roomAccess,
        roomPassword: hashedRoomPassword,
      });
      roomId = roomResult['identifiers'][0]['roomId'];
      await q.manager.insert(ChatRoomUser, {
        roomId,
        userId: roomOwnerId,
        role: 'admin',
      });
      await q.commitTransaction();
    } catch (e) {
      await q.rollbackTransaction();
      throw toRmqError(e);
    } finally {
      await q.release();
    }
    return { room_id: roomId };
  }

  //XXX: RoomExistsGuard, OwnerGuard
  //NOTE: now on delete room, CASCADE room-users. what if on distributed-DB? */
  async deleteRoom(room: ChatRoom) {
    try {
      await this.chatRoomRepo.remove(room);
    } catch (e) {
      throw toRmqError(e);
    }
    /* if room not exists, cannot reach here. always return 1 */
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard
  async joinRoom(room: ChatRoom, chatRoomJoinDto: ChatRoomJoinDto) {
    const {
      room_id: roomId,
      user_id: userId,
      room_password: roomPassword,
    } = chatRoomJoinDto;

    const bannedUser = await this.chatRoomBanListRepo.findOne({
      where: {
        roomId,
        userId,
        expiry: MoreThan(new Date()),
      },
    });
    if (bannedUser) throw new BannedUserError();

    if (room.roomAccess == 'protected') {
      const matches = bcrypt.compareSync(roomPassword, room.roomPassword);
      if (!matches) throw new InvalidPasswordError();
    }

    try {
      await this.chatRoomUserRepo.insert({ roomId, userId });
    } catch (e) {
      throw toRmqError(e);
    }
    return { room_id: roomId, user_id: userId };
  }

  //XXX: RoomExistsGuard
  async exitRoom(room: ChatRoom, chatRoomUserDto: ChatRoomUserDto) {
    const { user_id: userId, room_id: roomId } = chatRoomUserDto;
    const q = this.dbConnection.createQueryRunner();
    let affected;
    await q.startTransaction();
    try {
      /* remove user from room-user list */
      ({ affected } = await q.manager.delete(ChatRoomUser, {
        roomId,
        userId,
      }));

      /* If user was owner, need to set new owner */
      if (userId === room.roomOwnerId) {
        let candidate;
        if (
          (candidate = await q.manager.findOneBy(ChatRoomUser, {
            roomId: room.roomId,
            role: 'admin',
          })) ||
          (candidate = await q.manager.findOneBy(ChatRoomUser, {
            roomId: room.roomId,
            role: 'user',
          }))
        ) {
          room.roomOwnerId = candidate.userId;
          candidate.role = 'admin';
          await q.manager.save(ChatRoom, room);
          await q.manager.save(ChatRoomUser, candidate);
        } else {
          /* If user was last (should be owner) */
          await q.manager.remove(ChatRoom, room);
        }
      }
      await q.commitTransaction();
    } catch (e) {
      await q.rollbackTransaction();
      throw toRmqError(e);
    } finally {
      await q.release();
    }
    return { affected };
  }

  //XXX: RoomExistsGuard, OwnerGuard
  async setRoomPassword(
    room: ChatRoom,
    chatRoomSetPasswordDto: ChatRoomSetPasswordDto,
  ) {
    const { room_password: roomPassword } = chatRoomSetPasswordDto;

    /* if room is private, doesn't need password */
    if (room.roomAccess == 'private')
      throw new RmqError({
        code: 400,
        message: 'cannot set room password to private room',
        where: 'chat-service',
      }); // 혹은, protected || public으로 전환된다는 메세지 출력

    let newAccess: ChatRoomAccess;
    let hashedPassword;

    if (!roomPassword) {
      newAccess = ChatRoomAccess.PUBLIC;
      hashedPassword = null;
    } else {
      newAccess = ChatRoomAccess.PROTECTED;
      hashedPassword = bcrypt.hashSync(roomPassword, ChatService.SALT);
    }

    let affected;
    try {
      ({ affected } = await this.chatRoomRepo.update(room.roomId, {
        roomPassword: hashedPassword,
        roomAccess: newAccess,
      }));
    } catch (e) {
      throw toRmqError(e);
    }
    return { affected };
  }

  async setRoomAccessibility(
    room: ChatRoom,
    chatRoomAccessibilityDto: ChatRoomAccessibilityDto,
  ) {
    if (room.roomAccess === ChatRoomAccess.PROTECTED)
      throw new RmqError({
        code: 400,
        message: 'cannot set accessibility of protected room',
        where: 'chat-service',
      });
    if (chatRoomAccessibilityDto.room_access === ChatRoomAccess.PROTECTED)
      throw new RmqError({
        code: 400,
        message: 'cannot set accessibility to protected',
        where: 'chat-service',
      });

    room.roomAccess = chatRoomAccessibilityDto.room_access;
    try {
      await this.chatRoomRepo.save(room);
    } catch (e) {
      throw toRmqError(e);
    }
    this.publishRoomEvent(
      room.roomId,
      'announcement',
      [],
      `room accessibility changed to ${room.roomAccess}`,
    );
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, OwnerGuard
  async setRole(room: ChatRoom, chatUserRoleDto: ChatUserRoleDto) {
    /* if owner try to set role itself, reject */
    if (chatUserRoleDto.user_id === room.roomOwnerId)
      throw new RmqError({
        code: 400,
        message: "cannot change owner's role",
        where: 'chat-service',
      });

    /* if user not in room, reject */
    const userInRoom = await this.chatRoomUserRepo.findOneBy({
      roomId: room.roomId,
      userId: chatUserRoleDto.user_id,
    });
    if (!userInRoom) throw new UserNotInScopeError();

    userInRoom.role = chatUserRoleDto.role;
    try {
      await this.chatRoomUserRepo.save(userInRoom);
    } catch (e) {
      throw toRmqError(e);
    }
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async kickUser(room: ChatRoom, ChatRoomPenaltyDto: ChatRoomPenaltyDto) {
    const {
      user_id: userId,
      room_admin_id: roomAdminId,
      room_id: roomId,
    } = ChatRoomPenaltyDto;

    if (roomAdminId === userId) throw new SelfPenalizeError();
    try {
      /* if user not in room, reject */
      const userInRoom = await this.chatRoomUserRepo.findOneBy({
        roomId: room.roomId,
        userId,
      });

      if (!userInRoom) throw new UserNotInScopeError();

      /* if user is admin, only owner is able to ban */
      const userRole = userInRoom.role;
      if (userRole == 'admin' && roomAdminId !== room.roomOwnerId)
        throw new OwnerPrivileageError();

      /* remove from room-user */
      await this.chatRoomUserRepo.remove(userInRoom);
    } catch (e) {
      throw e instanceof RmqError ? e : toRmqError(e);
    }

    this.publishRoomEvent(roomId, 'kick', [userId], `You've been KICKED!`);
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async banUser(
    room: ChatRoom,
    ChatRoomPenaltyWithTimeDto: ChatRoomPenaltyWithTimeDto,
  ) {
    const {
      user_id: userId,
      room_admin_id: roomAdminId,
      room_id: roomId,
      time_amount_in_seconds,
    } = ChatRoomPenaltyWithTimeDto;

    if (roomAdminId === userId) throw new SelfPenalizeError();
    const q = this.dbConnection.createQueryRunner();
    await q.startTransaction();
    try {
      /* if user not in room, reject */
      const userInRoom = await q.manager.findOneBy(ChatRoomUser, {
        roomId: room.roomId,
        userId,
      });

      if (!userInRoom) throw new UserNotInScopeError();

      /* if user is admin, only owner is able to ban */
      const userRole = userInRoom.role;
      if (userRole == 'admin' && roomAdminId !== room.roomOwnerId)
        throw new OwnerPrivileageError();

      /* remove from room-user */
      await q.manager.remove(ChatRoomUser, userInRoom);

      /* upsert: avoid confilct when ban user whose ban-time expired, but not removed from mute-list yet */
      await q.manager.upsert(
        ChatRoomBanList,
        {
          roomId,
          userId,
          role: userRole,
          expiry: this.getExpiry(time_amount_in_seconds),
        },
        ['roomId', 'userId'],
      );
      await q.commitTransaction();
    } catch (e) {
      await q.rollbackTransaction();
      throw e instanceof RmqError ? e : toRmqError(e);
    } finally {
      await q.release();
    }

    this.publishRoomEvent(roomId, 'ban', [userId], `You've been BANNED!`);
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async unbanUser(
    room: ChatRoom,
    chatRoomUnpenalizeDto: ChatRoomUnpenalizeDto,
  ) {
    const {
      room_admin_id: roomAdminId,
      user_id: userId,
      room_id: roomId,
    } = chatRoomUnpenalizeDto;

    const q = this.dbConnection.createQueryRunner();
    await q.startTransaction();
    try {
      /* except expired: will be managed by cron-job */
      const bannedUser = await q.manager.findOneBy(ChatRoomBanList, {
        roomId,
        userId,
        expiry: MoreThan(new Date()),
      });
      if (!bannedUser) throw new UserNotInScopeError();

      /* only owner is able to unban admin */
      if (bannedUser.role == 'admin' && roomAdminId !== room.roomOwnerId)
        throw new OwnerPrivileageError();

      /* remove from ban-list */
      await q.manager.remove(ChatRoomBanList, bannedUser);
      await q.commitTransaction();
    } catch (e) {
      await q.rollbackTransaction();
      throw e instanceof RmqError ? e : toRmqError(e);
    } finally {
      await q.release();
    }

    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async getBanlist(room: ChatRoom) {
    let list: ChatRoomBanList[];
    try {
      list = await this.chatRoomBanListRepo.findBy({
        roomId: room.roomId,
        expiry: MoreThan(new Date()),
      });
    } catch (e) {
      throw toRmqError(e);
    }
    return {
      banned: list.map((banned) => {
        return { user_id: banned.userId, expiry: banned.expiry };
      }),
    };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async muteUser(
    room: ChatRoom,
    ChatRoomPenaltyWithTimeDto: ChatRoomPenaltyWithTimeDto,
  ) {
    const {
      user_id: userId,
      room_admin_id: roomAdminId,
      room_id: roomId,
      time_amount_in_seconds,
    } = ChatRoomPenaltyWithTimeDto;

    if (roomAdminId === userId) throw new SelfPenalizeError();
    const q = this.dbConnection.createQueryRunner();
    await q.startTransaction();
    try {
      /* if user not in room, reject */
      const userInRoom = await q.manager.findOneBy(ChatRoomUser, {
        roomId: room.roomId,
        userId: userId,
      });
      if (!userInRoom) throw new UserNotInScopeError();

      /* if user is admin, only owner is able to mute */
      const userRole = userInRoom.role;
      if (userRole == 'admin' && roomAdminId !== room.roomOwnerId)
        throw new OwnerPrivileageError();

      /* upsert: avoid confilct when re-mute user whose mute-time expired, but not removed from mute-list yet */
      await q.manager.upsert(
        ChatRoomMuteList,
        {
          roomId,
          userId,
          role: userRole,
          expiry: this.getExpiry(time_amount_in_seconds),
        },
        ['userId', 'roomId'],
      );
      await q.commitTransaction();
    } catch (e) {
      await q.rollbackTransaction();
      throw e instanceof RmqError ? e : toRmqError(e);
    } finally {
      await q.release();
    }
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async unmuteUser(
    room: ChatRoom,
    chatRoomUnpenalizeDto: ChatRoomUnpenalizeDto,
  ) {
    const {
      room_admin_id: roomAdminId,
      user_id: userId,
      room_id: roomId,
    } = chatRoomUnpenalizeDto;

    const q = this.dbConnection.createQueryRunner();
    await q.startTransaction();
    try {
      /* except expired: will be managed by cron-job */
      const mutedUser = await q.manager.findOneBy(ChatRoomMuteList, {
        roomId: roomId,
        userId: userId,
        expiry: MoreThan(new Date()),
      });
      if (!mutedUser) throw new UserNotInScopeError();

      /* only owner is able to unmute admin  */
      if (mutedUser.role == 'admin' && roomAdminId !== room.roomOwnerId)
        throw new OwnerPrivileageError();

      /* remove from mute-list */
      await q.manager.remove(ChatRoomMuteList, mutedUser);
      await q.commitTransaction();
    } catch (e) {
      await q.rollbackTransaction();
      throw e instanceof RmqError ? e : toRmqError(e);
    } finally {
      await q.release();
    }
    return { affected: 1 };
  }

  //XXX: RoomExistsGuard, AdminGuard
  async getMutelist(room: ChatRoom) {
    let list: ChatRoomMuteList[];
    try {
      list = await this.chatRoomMuteListRepo.findBy({
        roomId: room.roomId,
        expiry: MoreThan(new Date()),
      });
    } catch (e) {
      throw toRmqError(e);
    }
    return {
      muted: list.map((muted) => {
        return { user_id: muted.userId, expiry: muted.expiry };
      }),
    };
  }

  async storeRoomMessage(chatRoomMessageDto: ChatRoomMessageDto) {
    const { room_id: roomId, message } = chatRoomMessageDto;
    const userInRoom = await this.chatRoomUserRepo.findOneBy({
      roomId,
      userId: message.sender_id,
    });
    if (!userInRoom) throw new UserNotInScopeError();
    if (
      await this.chatRoomMuteListRepo.findOne({
        where: {
          userId: userInRoom.userId,
          roomId: userInRoom.roomId,
          expiry: MoreThan(new Date()),
        },
      })
    )
      throw new MutedUserError();

    const result = await this.chatRoomMessageRepo.save({
      roomId,
      senderId: message.sender_id,
      payload: message.payload,
    });
    return {
      message: {
        room_msg_id: result.roomMsgId,
        room_id: result.roomId,
        sender_id: result.senderId,
        payload: result.payload,
        created: result.created,
      },
    };
  }

  async getAllRoomMessages(chatRoomUserDto: ChatRoomUserDto) {
    const room = await this.chatRoomRepo.findOne({
      where: {
        roomId: chatRoomUserDto.room_id,
      },
      order: {
        messages: {
          created: 'ASC',
        },
      },
      relations: ['messages', 'messages.sender'],
    });

    return {
      messages: (
        await Promise.all(
          room.messages.map(async (message) => {
            if (!message.sender)
              return {
                room_msg_id: message.roomMsgId,
                sender: null,
                room_id: message.roomId,
                payload: message.payload,
                created: message.created,
              };

            if (
              !(await this.userService.isBlocked({
                blocker: chatRoomUserDto.user_id,
                blocked: message.sender.user_id,
              }))
            )
              return {
                room_msg_id: message.roomMsgId,
                sender: toUserProfile(message.sender),
                room_id: message.roomId,
                payload: message.payload,
                created: message.created,
              };
          }),
        )
      ).filter((message) => message),
    };
  }

  async getJoinedRooms(userId: string) {
    const userInRooms = await this.chatRoomUserRepo.find({
      where: {
        userId,
      },
      relations: ['room'],
    });

    return {
      rooms: userInRooms.map((userInRoom) => {
        const room = userInRoom.room;
        return {
          room_id: room.roomId,
          room_name: room.roomName,
          room_owner_id: room.roomOwnerId,
          room_access: room.roomAccess,
          created: room.created,
        };
      }),
    };
  }

  async inviteUser(
    room: ChatRoom,
    roomUser: UserProfile,
    chatRoomInviteDto: ChatRoomInviteDto,
  ) {
    const {
      room_id: roomId,
      user_id: senderId,
      receiver_id: receiverId,
    } = chatRoomInviteDto;

    if (
      await this.userService.isBlocked({
        blocker: receiverId,
        blocked: senderId,
      })
    )
      return;

    const bannedUser = await this.chatRoomBanListRepo.findOneBy({
      roomId,
      userId: receiverId,
      expiry: MoreThan(new Date()),
    });
    if (bannedUser) throw new BannedUserError();

    try {
      await this.chatRoomUserRepo.insert({ roomId, userId: receiverId });
    } catch (e) {
      throw toRmqError(e);
    }

    this.publishChatEvent('invitation', [receiverId], {
      sender: roomUser,
      room_info: {
        room_id: room.roomId,
        room_name: room.roomName,
        room_owner_id: room.roomOwnerId,
        room_access: room.roomAccess,
        created: room.created,
      },
    });
    return { room_id: roomId, user_id: receiverId };
  }

  //@--------------------------------Cron Job------------------------------@//
  /*
    * * * * * *
    | | | | | |
    | | | | | day of week
    | | | | months
    | | | day of month
    | | hours
    | minutes
    seconds (optional)
  */
  @Cron('0 0 * * * *')
  async purgeExpired() {
    const banResult = await this.chatRoomBanListRepo.delete({
      expiry: LessThanOrEqual(new Date()),
    });
    const muteResult = await this.chatRoomMuteListRepo.delete({
      expiry: LessThanOrEqual(new Date()),
    });
    this.logger.log(
      `purge ${banResult.affected} ban-list, ${muteResult.affected} mute-list`,
    );
  }
}
