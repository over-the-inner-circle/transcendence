import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomMessage } from './chat-room-message.entity';
import { User } from './user.entity';

//NOTE: 서비스별로 데이터베이스 분리할 수도 있으나, 일단 User 엔티티를 알고 있다고 가정하고 서비스 구현

export enum ChatRoomAccess {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  roomId: string;

  @Column('text')
  roomName: string;

  @Column({
    type: 'enum',
    enum: ChatRoomAccess,
    default: ChatRoomAccess.PUBLIC,
  })
  roomAccess: ChatRoomAccess;

  @Column('text', { nullable: true })
  roomPassword: string;

  @Column('text')
  roomOwnerId: string;

  @CreateDateColumn()
  created: string;

  // //ManyToOne==FK
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // owner 탈퇴시 방 폭파 ㅋㅋ;
  @JoinColumn({ name: 'room_owner_id' })
  roomOwner: User;

  @OneToMany(() => ChatRoomMessage, (message) => message.room)
  messages: ChatRoomMessage[];
}
