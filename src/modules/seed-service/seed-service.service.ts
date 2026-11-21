import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth, UserRole, UserStatus } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { hash } from 'bcrypt';

@Injectable()
export class SeedServiceService implements OnModuleInit {
  constructor(
    @InjectRepository(Auth)
    private readonly users: Repository<Auth>,
    @InjectRepository(Profile)
    private readonly profile: Repository<Profile>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminUsername = String(process.env.ADMIN_USERNAME);
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const existingAdmin = await this.users.findOne({
      where: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (!adminUsername || !adminEmail || !adminPassword) {
      return;
    }

    if (existingAdmin) return;

    const hashedPassword = await hash(String(adminPassword), 10);

    const adminUser = this.users.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      isVerified: true,
    });

    const savedAdmin = await this.users.save(adminUser);

    const adminProfile = this.profile.create({
      user: savedAdmin,
      level: 1,
      current_xp: 0,
      next_level_xp: 100,
      rank: 'Bronze',
      kills: 0,
      deaths: 0,
      matches_won: 0,
      matches_played: 0,
    });

    await this.profile.save(adminProfile);
  }
}
