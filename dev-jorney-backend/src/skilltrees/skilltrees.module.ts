import { Module } from '@nestjs/common';
import { SkilltreesController } from './skilltrees.controller';
import { SkilltreesService } from './skilltrees.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkilltreesController],
  providers: [SkilltreesService],
  exports: [SkilltreesService],
})
export class SkilltreesModule {}

