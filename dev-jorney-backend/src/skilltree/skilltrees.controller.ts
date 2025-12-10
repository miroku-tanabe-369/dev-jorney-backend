import { Controller, Get, Param } from '@nestjs/common';
import { SkilltreesService } from './skilltrees.service';
import { SkilltreeResponseDto } from './dto/skilltreeResponse.dto';

@Controller('skilltrees')
export class SkilltreesController {
  constructor(private readonly skilltreesService: SkilltreesService) {}

  @Get('skilltree/:skilltreeCode')
  async getSkilltree(
    @Param('skilltreeCode') skilltreeCode: string
  ): Promise<SkilltreeResponseDto> {

    //認証ガード実装予定

    if(!skilltreeCode) {
      throw new Error('skilltreeCode is required');
    }

    return this.skilltreesService.getSkilltree(skilltreeCode);
  }
}

