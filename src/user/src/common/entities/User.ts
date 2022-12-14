import { Expose } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('user')
@Index(['provider', 'third_party_id'], { unique: true })
export class User {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Expose()
  @Column({ unique: true })
  nickname: string;

  @Expose()
  @Column()
  provider: string;

  @Expose()
  @Column()
  third_party_id: string;

  @Column({ unique: true, nullable: true })
  two_factor_authentication_key: string;

  @Column({ nullable: true })
  two_factor_authentication_type: string;

  @Column()
  is_two_factor_authentication_enabled: boolean;

  @Expose()
  @Column({ nullable: true })
  prof_img: string;

  @Column()
  mmr: number;

  // @CreateDateColumn()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: Date;

  @DeleteDateColumn()
  deleted: Date;
}
