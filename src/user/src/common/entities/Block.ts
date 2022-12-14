import { User } from './User';
import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('block')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  block_id: string;

  @Column()
  blocker: string;

  @Column()
  blocked: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: Date;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocker' })
  user_blocker: User;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked' })
  user_blocked: User;
}
