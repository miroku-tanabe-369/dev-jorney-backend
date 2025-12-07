import { Controller, Get, Param, ParseUUIDPipe, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDetailResponseDto } from './dto/userDetailResponse.dto';
import { UserDashboardResponseDto } from './dto/userDashboardResponse.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 認証ガード（今後実装）

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ダッシュボード用の概要情報を取得
   * プロフィール詳細よりも軽量な情報を返す
   * JWTトークンからユーザーIDを取得するため、パラメータは不要
   */
  // @UseGuards(JwtAuthGuard) // 認証ガード（今後実装）
  @Get('dashboard')
  async getDashboard(@Request() req): Promise<UserDashboardResponseDto> {
    const userId = req.user.sub; // Cognitoのsub（ユーザーID）
    return this.usersService.getUserDashboard(userId);
    // 暫定実装: 認証ガード実装後に有効化
    throw new Error('Authentication not implemented yet');
  }

  /**
   * ログイン済みユーザーが自分のプロフィール情報を取得
   * JWTトークンからユーザーIDを取得するため、パラメータは不要
   */
  // @UseGuards(JwtAuthGuard) // 認証ガード（今後実装）
  @Get('profile')
  async getProfile(@Request() req): Promise<UserDetailResponseDto> {
    const userId = req.user.sub; // Cognitoのsub（ユーザーID）
    return this.usersService.getUserDetail(userId);
    // 暫定実装: 認証ガード実装後に有効化
    throw new Error('Authentication not implemented yet');
  }

}

