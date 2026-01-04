import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestDetailResponseDto } from './dto/questDetailResponse.dto';

@Injectable()
export class QuestsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * クエスト詳細情報を取得する
   * 
   * @param questCode 
   * @param userId ユーザーID（認証必須）
   * @returns QuestDetailResponseDto
   * @throws Error
   */
  async getQuestDetail(questCode: string, userId: string): Promise<QuestDetailResponseDto> {
    const quest = await this.prisma.questMst.findUnique({
      select: {
        questCode: true,
        nodeCode: true,
        questName: true,
        questDetail: true,
        exp: true,
        skillPoint: true,
        difficulty: true,
        recommendedTime: true,
        learningObjectives: true,
        achievementConditions: true,
        checklistItems: true,
        updatedAt: true, // デバッグ用：更新日時を取得
        questProgresses: {
          where: {
            userId: userId,
          },
          select: {
            progress: true,
            statusCode: true,
          }
        }
      },
      where: {
        questCode: questCode,
      }
    });

    if (!quest) {
      throw new Error(`Quest with code ${questCode} not found`);
    }

    // デバッグ用ログ（本番環境では削除推奨）
    console.log(`[QuestService] getQuestDetail: questCode=${questCode}, questName="${quest.questName}", updatedAt=${quest.updatedAt}`);

    return {
      questCode: quest.questCode,
      nodeCode: quest.nodeCode,
      questName: quest.questName,
      questDetail: quest.questDetail,
      exp: quest.exp,
      skillPoint: quest.skillPoint,
      difficulty: quest.difficulty,
      recommendedTime: quest.recommendedTime,
      learningObjectives: quest.learningObjectives as string[],
      achievementConditions: quest.achievementConditions as string[],
      checklistItems: quest.checklistItems as string[],
      progress: quest.questProgresses[0]?.progress ?? 0,
      statusCode: quest.questProgresses[0]?.statusCode ?? 'NOT_STARTED',
    };
  }

  /**
   * クエストを進行中に変更する
   * @param questCode 
   * @param userid 
   * @returns 
   * @throws Error
   */
  async startQuest(questCode: string, userid: string) {
    // クエストマスタの存在確認
    const questMaster = await this.prisma.questMst.findUnique({
      where: { questCode },
      select: {
        questCode: true,
        nodeCode: true,
      },
    });

    if (!questMaster) {
      throw new Error(`Quest with code ${questCode} not found`);
    }

    // クエストの進捗情報を更新（存在しない場合は作成）
    await this.prisma.questProgressTran.upsert({
      where: {
        userId_questCode: {
          userId: userid,
          questCode: questCode,
        },
      },
      update: {
        progress: 0,
        statusCode: 'IN_PROGRESS',
        updatedBy: userid,
      },
      create: {
        userId: userid,
        questCode: questCode,
        progress: 0,
        statusCode: 'IN_PROGRESS',
        createdBy: userid,
        updatedBy: userid,
      },
    });

    return {
      success: true,
      questCode,
      statusCode: 'IN_PROGRESS',
    };
  }

  /**
   * クエスト詳細情報を更新する（完了処理）
   * @param questCode 
   * @param userid 
   * @returns 
   * @throws Error
   */
  async updateQuestProgress(questCode: string, userid: string) {
    // トランザクションを使用して複数のテーブルを更新
    return await this.prisma.$transaction(async (tx) => {
      // 1. クエストマスタからマスタデータを取得（exp、skillPoint、nodeCodeなど）
      const questMaster = await tx.questMst.findUnique({
        where: { questCode },
        select: {
          exp: true,
          skillPoint: true,
          nodeCode: true,
          questOrder: true,
        },
      });

      if (!questMaster) {
        throw new Error(`Quest with code ${questCode} not found`);
      }

      // 2. クエストの進捗情報を更新（存在しない場合は作成）
      await tx.questProgressTran.upsert({
      where: {
        userId_questCode: {
          userId: userid,
          questCode: questCode,
        },
      },
        update: {
          progress: 100,
          statusCode: 'COMPLETED',
          updatedBy: userid,
        },
        create: {
          userId: userid,
          questCode: questCode,
          progress: 100,
          statusCode: 'COMPLETED',
          createdBy: userid,
          updatedBy: userid,
        },
      });

      // 3. ユーザーマスタの現在の情報を取得
      const userInfo = await tx.usersMst.findUnique({
        where: { userId: userid },
        select: {
          currentLevel: true,
          totalExp: true,
          totalSkillPoint: true,
          completedQuestCount: true,
        },
      });

      if (!userInfo) {
        throw new Error(`User with ID ${userid} not found`);
      }

      // 4. マスタデータから取得した値を使ってユーザーデータを更新
      const newTotalExp = userInfo.totalExp + questMaster.exp;
      const newTotalSkillPoint = userInfo.totalSkillPoint + questMaster.skillPoint;
      const newCompletedQuestCount = userInfo.completedQuestCount + 1;

      // レベルマスタからレベルを計算
      const levelInfo = await tx.levelMst.findMany({
        where: {
          level: {
            lte: userInfo.currentLevel + 10, // 最大10レベル先まで取得
          },
        },
        orderBy: { level: 'asc' },
      });

      // 新しいレベルを計算
      let newLevel = userInfo.currentLevel;
      let cumulativeExp = 0;
      for (let i = 0; i < levelInfo.length; i++) {
        cumulativeExp += levelInfo[i].requiredExp;
        if (newTotalExp >= cumulativeExp) {
          newLevel = levelInfo[i].level;
        } else {
          break;
        }
      }

      // ユーザーマスタを更新
      await tx.usersMst.update({
        where: { userId: userid },
      data: {
          currentLevel: newLevel,
          totalExp: newTotalExp,
          totalSkillPoint: newTotalSkillPoint,
          completedQuestCount: newCompletedQuestCount,
          updatedBy: userid,
        },
      });

      // 5. ノード配下のクエスト数を取得
      const nodeQuests = await tx.questMst.findMany({
        where: { nodeCode: questMaster.nodeCode },
        select: {
          questCode: true,
          questOrder: true,
        },
        orderBy: { questOrder: 'asc' },
      });

      // 6. ノード配下の完了済みクエストを取得
      const completedQuests = await tx.questProgressTran.findMany({
        where: {
          userId: userid,
          questCode: {
            in: nodeQuests.map((q) => q.questCode),
          },
          statusCode: 'COMPLETED',
        },
        select: {
          questCode: true,
        },
      });

      const completedQuestCodes = new Set(completedQuests.map((q) => q.questCode));
      const completedCount = nodeQuests.filter((q) =>
        completedQuestCodes.has(q.questCode),
      ).length;

      // ノードの進捗度を計算（完了したクエスト数 / 全クエスト数 * 100）
      const nodeProgress = Math.round(
        (completedCount / nodeQuests.length) * 100,
      );
      const nodeStatusCode =
        nodeProgress === 100 ? 'COMPLETED' : nodeProgress > 0 ? 'PROGRESS' : 'NOT_STARTED';

      // 7. ノード進捗状況を更新（存在しない場合は作成）
      await tx.nodeProgressTran.upsert({
        where: {
          userId_nodeCode: {
            userId: userid,
            nodeCode: questMaster.nodeCode,
          },
        },
        update: {
          progress: nodeProgress,
          statusCode: nodeStatusCode,
          updatedBy: userid,
        },
        create: {
          userId: userid,
          nodeCode: questMaster.nodeCode,
          progress: nodeProgress,
          statusCode: nodeStatusCode,
          createdBy: userid,
          updatedBy: userid,
        },
      });

      // 8. ノードが完了した場合、スキルツリーの進捗を更新
      if (nodeStatusCode === 'COMPLETED') {
        // ノードが属するスキルツリーを取得
        const skilltreeNodes = await tx.skilltreesNodeTran.findMany({
          where: { nodeCode: questMaster.nodeCode },
          select: { skilltreeCode: true },
        });

        for (const skilltreeNode of skilltreeNodes) {
          // スキルツリー配下の全ノードを取得
          const skilltreeAllNodes = await tx.skilltreesNodeTran.findMany({
            where: { skilltreeCode: skilltreeNode.skilltreeCode },
            select: { nodeCode: true },
          });

          // スキルツリー配下の完了済みノードを取得
          const completedNodes = await tx.nodeProgressTran.findMany({
            where: {
              userId: userid,
              nodeCode: {
                in: skilltreeAllNodes.map((n) => n.nodeCode),
              },
              statusCode: 'COMPLETED',
            },
            select: { nodeCode: true },
          });

          const completedNodeCodes = new Set(
            completedNodes.map((n) => n.nodeCode),
          );
          const completedNodeCount = skilltreeAllNodes.filter((n) =>
            completedNodeCodes.has(n.nodeCode),
          ).length;

          // スキルツリーの進捗度を計算
          const skilltreeProgress = Math.round(
            (completedNodeCount / skilltreeAllNodes.length) * 100,
          );
          const skilltreeStatusCode =
            skilltreeProgress === 100
              ? 'COMPLETED'
              : skilltreeProgress > 0
                ? 'PROGRESS'
                : 'NOT_STARTED';

          // スキルツリー進捗状況を更新
          await tx.skilltreeProgressTran.upsert({
            where: {
              userId_skilltreeCode: {
                userId: userid,
                skilltreeCode: skilltreeNode.skilltreeCode,
              },
            },
            update: {
              progress: skilltreeProgress,
              statusCode: skilltreeStatusCode,
              updatedBy: userid,
            },
            create: {
              userId: userid,
              skilltreeCode: skilltreeNode.skilltreeCode,
              progress: skilltreeProgress,
              statusCode: skilltreeStatusCode,
              createdBy: userid,
              updatedBy: userid,
            },
          });
        }
      }

      // 9. ノードコードからスキルコードを取得（ノードコードとスキルコードが同じ命名規則と仮定）
      // 例: NODE_F001 → SKILL_F001
      const skillCode = questMaster.nodeCode.replace(/^NODE_/, 'SKILL_');

      // スキルが存在するか確認
      const skillExists = await tx.skillsMst.findUnique({
        where: { skillCode },
      });

      if (skillExists) {
        // ユーザー取得スキルを更新（存在しない場合は作成）
        await tx.usersSkillsTran.upsert({
          where: {
            userId_skillCode: {
              userId: userid,
              skillCode: skillCode,
            },
          },
          update: {
            level: 'ACQUIRED', // または適切なレベル値
            updatedBy: userid,
          },
          create: {
            userId: userid,
            skillCode: skillCode,
            level: 'ACQUIRED', // または適切なレベル値
            createdBy: userid,
            updatedBy: userid,
          },
        });
      }

      return {
        success: true,
        questCode,
        nodeCode: questMaster.nodeCode,
        newLevel,
        newTotalExp,
        newTotalSkillPoint,
      };
    });
  }
}

