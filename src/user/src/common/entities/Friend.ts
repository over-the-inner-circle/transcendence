import { User } from './User';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('friend')
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  friend_id: string;

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
  user_requester: User;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver' })
  user_receiver: User;
}
