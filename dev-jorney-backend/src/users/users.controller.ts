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
   * 
   * TODO: 認証実装後は、@Request() reqからuserIdを取得するように変更
   * 現在はテスト用にuserIdをクエリパラメータで受け取る
   */
  // @UseGuards(JwtAuthGuard) // 認証ガード（今後実装）
  @Get('dashboard')
  async getDashboard(@Request() req): Promise<UserDashboardResponseDto> {
    // 暫定実装: 認証ガード実装前のテスト用
    // 認証実装後は以下のコメントアウトを解除し、クエリパラメータの処理を削除
    // const userId = req.user.sub; // Cognitoのsub（ユーザーID）
    
    // テスト用: クエリパラメータからuserIdを取得
    const userId = (req.query?.userId as string) || req.user?.sub;
    if (!userId) {
      throw new Error('userId is required. Please provide userId as query parameter for testing.');
    }
    
    return this.usersService.getUserDashboard(userId);
  }

  /**
   * ログイン済みユーザーが自分のプロフィール情報を取得
   * JWTトークンからユーザーIDを取得するため、パラメータは不要
   * 
   * TODO: 認証実装後は、@Request() reqからuserIdを取得するように変更
   * 現在はテスト用にuserIdをクエリパラメータで受け取る
   */
  // @UseGuards(JwtAuthGuard) // 認証ガード（今後実装）
  @Get('profile')
  async getProfile(@Request() req): Promise<UserDetailResponseDto> {
    // 暫定実装: 認証ガード実装前のテスト用
    // 認証実装後は以下のコメントアウトを解除し、クエリパラメータの処理を削除
    // const userId = req.user.sub; // Cognitoのsub（ユーザーID）
    
    // テスト用: クエリパラメータからuserIdを取得
    const userId = (req.query?.userId as string) || req.user?.sub;
    if (!userId) {
      throw new Error('userId is required. Please provide userId as query parameter for testing.');
    }
    
    return this.usersService.getUserDetail(userId);
  }

}

