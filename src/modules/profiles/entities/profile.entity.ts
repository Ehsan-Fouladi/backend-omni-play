import { Auth } from 'src/modules/auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => Auth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Auth;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'int' })
  current_xp: number;

  @Column({ type: 'int' })
  next_level_xp: number;

  @Column({ type: 'varchar', length: 255 })
  rank: string;

  @Column({ type: 'int' })
  kills: number;

  @Column({ type: 'int' })
  deaths: number;

  @Column({ type: 'int' })
  matches_won: number;

  @Column({ type: 'int' })
  matches_played: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
