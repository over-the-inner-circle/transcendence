import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from './user.entity';

//NOTE: 서비스별로 데이터베이스 분리할 수도 있으나, 일단 User 엔티티를 알고 있다고 가정하고 서비스 구현
@Entity()
export class ChatRoomMessage {
  @PrimaryGeneratedColumn()
  roomMsgId: number;

  @Column('text', { nullable: true })
  senderId: Date;

  @Column('text', { nullable: true })
  roomId: Date;

  @Column('text')
  payload: string;

  @CreateDateColumn()
  created: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;
}
