import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChatUserRole } from './chat-room-user.entity';
import { ChatRoom } from './chat-room.entity';
import { User } from './user.entity';

//NOTE: 서비스별로 데이터베이스 분리할 수도 있으나, 일단 User 엔티티를 알고 있다고 가정하고 서비스 구현
@Entity()
export class ChatRoomBanList {
  @PrimaryColumn()
  roomId: string;

  @PrimaryColumn()
  userId: string;

  @Column('enum', {
    enum: ChatUserRole,
    default: ChatUserRole.USER,
  })
  role: string;

  @Column('timestamptz')
  expiry: Date;

  @ManyToOne(() => ChatRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
