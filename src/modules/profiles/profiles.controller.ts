import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/auth.entity';
import { UpdateMatchStatsDto } from './dto/UpdateMatchStats.dto';
import { LeaderboardQueryDto } from './dto/Leaderboard.dto';
import { UpdateUserStatusDto } from './dto/UpdateUserStatus.dto';

@Controller('profiles')
@ApiBearerAuth('authorization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOkResponse({ description: 'پروفایل شخصی شما' })
  @ApiNotFoundResponse({ description: 'پروفایل کاربر یافت نشد' })
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.OK)
  getMyProfile(@Req() req) {
    return this.profilesService.getProfileByUserId(req.user.id);
  }

  @Get('leaderboard')
  @ApiOkResponse({ description: 'لیست برترین بازیکنان (لیدربورد)' })
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.OK)
  getLeaderboard(@Query() leaderboardQueryDto: LeaderboardQueryDto) {
    return this.profilesService.getLeaderboard(leaderboardQueryDto.limit);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'پروفایل کاربر مورد نظر با موفقیت نمایش داده شد',
  })
  @ApiNotFoundResponse({ description: 'پروفایل کاربر یافت نشد' })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.OK)
  getProfile(@Param('id', ParseIntPipe) userId: number) {
    return this.profilesService.getProfileByUserId(userId);
  }

  @Patch('stats')
  @ApiOkResponse({ description: 'بروزرسانی آمار شما با موفقیت انجام شد' })
  @ApiNotFoundResponse({ description: 'پروفایل کاربر یافت نشد' })
  @ApiBody({ type: UpdateMatchStatsDto })
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.OK)
  updateMatchStats(
    @Req() req,
    @Body() updateMatchStatsDto: UpdateMatchStatsDto,
  ) {
    return this.profilesService.updateMatchStats(
      req.user.id,
      updateMatchStatsDto,
    );
  }

  @Patch(':id/status')
  @ApiOkResponse({ description: 'تغییر وضعیت حساب کاربر توسط ادمین' })
  @ApiNotFoundResponse({ description: 'پروفایل کاربر یافت نشد' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiParam({ name: 'id', example: 1, type: Number })
  @ApiBody({ type: UpdateUserStatusDto })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserStatus: UpdateUserStatusDto,
  ) {
    return this.profilesService.updateUserStatus(id, updateUserStatus.status);
  }
}
