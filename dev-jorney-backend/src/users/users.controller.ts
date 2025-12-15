import { Controller, Get, Put, Request, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDetailResponseDto } from './dto/userDetailResponse.dto';
import { UserDashboardResponseDto } from './dto/userDashboardResponse.dto';
import { updateProfileRequestDto } from './dto/updateProfileRequest.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ダッシュボード用の概要情報を取得
   * プロフィール詳細よりも軽量な情報を返す
   * JWTトークンからユーザーIDを取得するため、パラメータは不要
   * 
   * 認証: 必須（グローバルガードにより保護）
   */
  @Get('dashboard')
  async getDashboard(@Request() req): Promise<UserDashboardResponseDto> {
    // JWT Guardが検証済みのユーザー情報からユーザーIDを取得
    const userId = req.user.sub;
    
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }
    
    return this.usersService.getUserDashboard(userId);
  }

  /**
   * ログイン済みユーザーが自分のプロフィール情報を取得
   * JWTトークンからユーザーIDを取得するため、パラメータは不要
   * 
   * 認証: 必須（グローバルガードにより保護）
   */
  @Get('profile')
  async getProfile(@Request() req): Promise<UserDetailResponseDto> {
    // JWT Guardが検証済みのユーザー情報からユーザーIDを取得
    const userId = req.user.sub;
    
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }
    
    return this.usersService.getUserDetail(userId);
  }

  /**
   * プロフィール情報更新
   * users_mstテーブルから更新
   * 
   * 認証: 必須（グローバルガードにより保護）
   */
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: updateProfileRequestDto,
  ) {
    // JWT Guardが検証済みのユーザー情報からユーザーIDを取得
    const userId = req.user.sub;
    
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }

    return this.usersService.updateProfile(userId, updateProfileDto);
  }

}

