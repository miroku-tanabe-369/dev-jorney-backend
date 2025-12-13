import { Controller, Get, Param, Put, Request } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { QuestDetailResponseDto } from './dto/questDetailResponse.dto';
import { Public } from '../auth/public.decorator';

/**
 * クエストコントローラー
 * 
 * 認証:
 * - クエスト詳細取得: 認証不要（@Public()）
 * - クエスト進捗更新: 認証必須（グローバルガードにより保護）
 */
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /**
   * クエスト詳細情報を取得
   * 
   * 認証: 不要（@Public()デコレータにより認証をスキップ）
   */
  @Public()
  @Get('quest-detail/:questCode')
  async getQuestDetail(
    @Param('questCode') questCode: string
  ): Promise<QuestDetailResponseDto> {
    if (!questCode) {
      throw new Error('questCode is required');
    }

    return this.questsService.getQuestDetail(questCode);
  }

  /**
   * クエスト進捗情報を更新する
   * 
   * 認証: 必須（JWTトークンからユーザーIDを取得）
   */
  @Put('update-quest-progress/:questCode')
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

