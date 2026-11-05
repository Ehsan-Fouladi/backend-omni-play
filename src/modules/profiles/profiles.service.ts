import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { UpdateMatchStatsDto } from './dto/UpdateMatchStats.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profiles: Repository<Profile>,
  ) {}

  // async createProfile(user: Auth): Promise<Profile> {
  //   const profile = await this.profiles.create({
  //     user,
  //     level: 1,
  //     current_xp: 0,
  //     next_level_xp: 100,
  //     rank: 'Bronze',
  //     kills: 0,
  //     deaths: 0,
  //     matches_won: 0,
  //     matches_played: 0,
  //   });
  //   return this.profiles.save(profile);
  // }

  async getProfileByUserId(userId: number): Promise<ApiResponse<Profile>> {
    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
      select: {
        id: true,
        avatar_url: true,
        level: true,
        current_xp: true,
        next_level_xp: true,
        rank: true,
        kills: true,
        deaths: true,
        matches_won: true,
        matches_played: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          isActive: true,
          last_login_at: true,
          created_at: true,
          updated_at: true,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل کاربر یافت نشد');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'پروفایل با موفقیت دریافت شد',
      data: profile,
    };
  }

  async updateMatchStats(
    userId: number,
    dto: UpdateMatchStatsDto,
  ): Promise<ApiResponse<Profile>> {
    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل کاربر یافت نشد');
    }

    profile.kills += dto.earnedKills;
    profile.deaths += dto.earnedDeaths;
    profile.matches_played += 1;

    if (dto.isMatchWon) {
      profile.matches_won += 1;
    }

    profile.current_xp += dto.earnedXp;

    while (profile.current_xp >= profile.next_level_xp) {
      profile.current_xp -= profile.next_level_xp;
      profile.level += 1;
      profile.next_level_xp = Math.floor(profile.next_level_xp * 1.5);
    }

    const saveProfile = await this.profiles.save(profile);

    return {
      statusCode: HttpStatus.OK,
      message: 'امار با موفقیت ذخیره شد',
      data: saveProfile,
    };
  }
}
