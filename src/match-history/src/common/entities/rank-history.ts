import { GameInfo } from './game-info.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index(['user_id', 'game_id'], { unique: true })
export class RankHistory {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  game_id: string;

  @Column()
  delta: number;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GameInfo, (gameInfo) => gameInfo.game_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_id' })
  game_info: GameInfo;
}
