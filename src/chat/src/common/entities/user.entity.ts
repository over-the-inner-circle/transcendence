import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

//NOTE: 서비스별로 데이터베이스 분리할 수도 있으나, 일단 User 엔티티를 알고 있다고 가정하고 서비스 구현
@Entity('user')
@Index(['provider', 'third_party_id'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  nickname: string;

  @Column()
  provider: string;

  @Column()
  third_party_id: string;

  @Column({ unique: true, nullable: true })
  two_factor_authentication_key: string;

  @Column({ nullable: true })
  two_factor_authentication_type: string;

  @Column()
  is_two_factor_authentication_enabled: boolean;

  @Column({ nullable: true })
  prof_img: string;

  @Column()
  mmr: number;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: Date;

  @DeleteDateColumn()
  deleted: Date;
}
