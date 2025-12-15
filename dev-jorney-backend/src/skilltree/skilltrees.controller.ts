import { Controller, Get, Param, Request } from '@nestjs/common';
import { SkilltreesService } from './skilltrees.service';
import { SkilltreeResponseDto } from './dto/skilltreeResponse.dto';

/**
 * スキルツリーコントローラー
 * 
 * 認証:
 * - スキルツリー詳細取得: 認証不要（@Public()）
 *   スキルツリー情報は公開情報のため、認証なしでアクセス可能
 */
@Controller('skilltrees')
export class SkilltreesController {
  constructor(private readonly skilltreesService: SkilltreesService) {}

  /**
   * スキルツリー詳細情報を取得
   */
  @Get('skilltree/:skilltreeCode')
  async getSkilltree(
    @Param('skilltreeCode') skilltreeCode: string,
    @Request() req,
  ): Promise<SkilltreeResponseDto> {

    //スキルツリー配下のノードの進捗状況を取得する
    const userId = req.user.sub;

    if(!skilltreeCode) {
      throw new Error('skilltreeCode is required');
    }

    return this.skilltreesService.getSkilltree(skilltreeCode, userId);
  }
}

