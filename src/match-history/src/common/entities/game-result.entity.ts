import { GameInfo } from './game-info.entity';
import { User } from './user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class GameResult {
  @PrimaryColumn()
  game_id: string;

  @Column()
  l_player_score: number;

  @Column()
  r_player_score: number;

  @Column({ nullable: true })
  winner_id: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  end_time: Date;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'winner_id' })
  user: User;

  @OneToOne(() => GameInfo, (gameInfo) => gameInfo.game_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_id' })
  game_info: GameInfo;
}
