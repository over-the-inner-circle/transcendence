import { User } from './User';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('friend_request')
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  request_id: string;

  @Column()
  requester: string;

  @Column()
  receiver: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: Date;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester' })
  requester_info: User;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver' })
  receiver_info: User;
}
