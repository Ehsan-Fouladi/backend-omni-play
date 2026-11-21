import { Module } from '@nestjs/common';
import { SeedServiceService } from './seed-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../auth/entities/auth.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, Profile])],
  providers: [SeedServiceService],
})
export class SeedServiceModule {}
