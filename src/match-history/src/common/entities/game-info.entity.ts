import { GameResult } from 'src/common/entities/game-result.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum GameMode {
  RANK = 'rank',
  FRIENDLY = 'friendly',
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
}

@Entity()
export class GameInfo {
  @PrimaryGeneratedColumn('uuid')
  game_id: string;

  @Column({ nullable: true })
  l_player_id: string;

  @Column({ nullable: true })
  r_player_id: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.NORMAL,
  })
  difficulty: Difficulty;

  @Column({
    type: 'enum',
    enum: GameMode,
    default: GameMode.RANK,
  })
  mode: GameMode;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  start_time: Date;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'l_player_id' })
  l_player: User;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'r_player_id' })
  r_player: User;
}
