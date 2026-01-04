import { Controller, Get, Param, Put, Request } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { QuestDetailResponseDto } from './dto/questDetailResponse.dto';

/**
 * クエストコントローラー
 * 
 * 認証:
 * - すべてのエンドポイント: 認証必須（グローバルガードにより保護）
 */
@Controller('quest-detail')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /**
   * クエスト詳細情報を取得
   * 
   * 認証: 必須（JWTトークンからユーザーIDを取得）
   */
  @Get(':questCode')
  async getQuestDetail(
    @Param('questCode') questCode: string,
    @Request() req,
  ): Promise<QuestDetailResponseDto> {
    if (!questCode) {
      throw new Error('questCode is required');
    }

    // JWT Guardが検証済みのユーザー情報からユーザーIDを取得
    const userId = req.user.sub;

    return this.questsService.getQuestDetail(questCode, userId);
  }

  /**
   * クエストを進行中に変更する
   * 
   * 認証: 必須（JWTトークンからユーザーIDを取得）
   */
  @Put('start-quest/:questCode')
  async startQuest(
    @Param('questCode') questCode: string,
    @Request() req,
  ) {
    // JWT Guardが検証済みのユーザー情報からユーザーIDを取得
    const userId = req.user.sub;
    
    if (!questCode) {
      throw new Error('questCode is required');
    }

    return this.questsService.startQuest(questCode, userId);
  }

  /**
   * クエスト進捗情報を更新する（完了処理）
   * 
   * 認証: 必須（JWTトークンからユーザーIDを取得）
   */
  @Put('complete-quest/:questCode')
  async updateQuestProgress(
    @Param('questCode') questCode: string,
    @Request() req,
  ) {
    // JWT Guardが検証済みのユーザー情報からユーザーIDを取得
    const userId = req.user.sub;
    
    if (!questCode) {
      throw new Error('questCode is required');
    }

    return this.questsService.updateQuestProgress(questCode, userId);
  }
}

