import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { SkilltreesModule } from './skilltrees/skilltrees.module';
import { NodesModule } from './nodes/nodes.module';
import { QuestsModule } from './quests/quests.module';
import { ChecklistsModule } from './checklists/checklists.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    SkillsModule,
    SkilltreesModule,
    NodesModule,
    QuestsModule,
    ChecklistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
