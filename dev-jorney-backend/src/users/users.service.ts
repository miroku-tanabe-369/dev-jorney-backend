import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDetailResponseDto } from './dto/userDetailResponse.dto';
import { UserDashboardResponseDto } from './dto/userDashboardResponse.dto';
import { updateProfileRequestDto } from './dto/updateProfileRequest.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ダッシュボード用の概要情報を取得
   * 
   *  @param userId: Cognitoのsub（ユーザーID）
   *  @returns UserDashboardResponseDto
   *  @throws NotFoundException
   */
  async getUserDashboard(userId: string): Promise<UserDashboardResponseDto> {
    const userInfo = await this.prisma.usersMst.findUnique({
      where: { userId },
      select: {
        name: true,
        currentLevel: true,
        totalExp: true,
        totalSkillPoint: true,
        completedQuestCount: true,
      },
    });

    if (!userInfo) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 1からcurrentLevel + 1までのレベル情報を取得

    // 各レベルの必要経験値を現在のレベルまで取得
    const levelInfo = await this.prisma.levelMst.findMany({
      select: {
        level: true,
        requiredExp: true,
      },
      where: {
        level: {
          gte: 1,                              // 1以上
          lte: userInfo.currentLevel + 1,     // currentLevel + 1以下
        },
      },
      orderBy: {
        level: 'asc',
      },
    });

    // 次のレベルに必要な経験値を算出する
    // 現在のレベルに到達するまでに必要な累積経験値を計算
    let cumulativeExp = 0;
    for (let i = 0; i < userInfo.currentLevel; i++) {
      cumulativeExp += levelInfo[i].requiredExp;
    }

    // 現在のレベル内での経験値（残り経験値）
    // totalExpから累積必要経験値を引いた値
    const remainingExp = userInfo.totalExp - cumulativeExp;

    // 次のレベル（currentLevel + 1）の必要経験値を取得
    // levelInfo配列は0始まりなので、currentLevelが5なら、level 6はindex 5
    const nextLevelInfo = levelInfo.find(
      (info) => info.level === userInfo.currentLevel + 1,
    );

    // 次のレベルに必要な経験値 = 次のレベルの必要経験値 - 残り経験値
    // マイナスにならないようにMath.maxで0以上を保証
    const requiredExp = nextLevelInfo
      ? Math.max(0, nextLevelInfo.requiredExp - remainingExp)
      : 0;


    // 進行中のクエストの取得
    // statusCodeが'PROGRESS'で、updatedAtが最古のレコードを取得
    const currentQuestProgress = await this.prisma.questProgressTran.findFirst({
      where: {
        userId: userId,
        statusCode: 'PROGRESS',
      },
      orderBy: {
        updatedAt: 'asc', // 最古のものを取得（asc = 昇順）
      },
      include: {
        // shcema.prismaで定義している、questリレーションから(QuestMstテーブル)questCodeを外部キーとして取得する。
        quest: {
          select: {
            questName: true,
            questDetail: true,
            recommendedTime: true,
            skillPoint: true,
          },
        },
      },
    });

    // クエスト情報をDTO形式に変換
    const currentQuest = currentQuestProgress
      ? {
          questName: currentQuestProgress.quest.questName,
          questDetail: currentQuestProgress.quest.questDetail,
          progress: currentQuestProgress.progress,
          recommendedTime: currentQuestProgress.quest.recommendedTime,
          skillPoint: currentQuestProgress.quest.skillPoint,
        }
      : null;

    // 最新完了済みクエストの取得（最新10件）
    const latestCompletedQuestsData = await this.prisma.questProgressTran.findMany({
      where: {
        userId: userId,
        statusCode: 'COMPLETED',
      },
      orderBy: {
        updatedAt: 'desc', // 最新のものを取得（desc = 降順）
      },
      take: 10, // 最新10件に制限
      include: {
        quest: {
          select: {
            questName: true,
            skillPoint: true,
          },
        },
      },
    });

    // DTO形式に変換
    const latestCompletedQuests = latestCompletedQuestsData.map((questProgress) => ({
      questName: questProgress.quest.questName,
      skillPoint: questProgress.quest.skillPoint,
      completedAt: questProgress.updatedAt, // 完了日時はquest_progress_tranのupdatedAtを使用
    }));

    return {
      userInfo: {
        name: userInfo.name,
        currentLevel: userInfo.currentLevel,
        requiredExp: requiredExp,
        totalSkillPoint: userInfo.totalSkillPoint,
        completedQuestCount: userInfo.completedQuestCount,
      },
      currentQuest: currentQuest,
      latestCompletedQuests: latestCompletedQuests,
    };
  }

  /**
   * プロフィール詳細情報を取得する。
   * 
   * @param userId: Cognitoのsub（ユーザーID）
   * @returns UserDetailResponseDto
   * @throws NotFoundException
   */
  async getUserDetail(userId: string): Promise<UserDetailResponseDto> {
    const user = await this.prisma.usersMst.findUnique({
      where: { userId },
      select: {
        name: true,
        email: true,
        profile: true,
        icon: true,
        currentLevel: true,
        totalExp: true,
        totalSkillPoint: true,
        completedQuestCount: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userSkills = (await this.prisma.usersSkillsTran.findMany({
      where: {
        userId: userId,
      },
      select: {
        level: true,
        skill: {
          select: {
            skillName: true,
          },
        },
      },
    })) as unknown as Array<{
      level: string;
      skill: { skillName: string };
    }>;

    return {
      userDetail: {
        name: user.name,
        currentLevel: user.currentLevel,
        email: user.email,
        profile: user.profile,
        icon: user.icon,
        totalSkillPoint: user.totalSkillPoint,
        completedQuestCount: user.completedQuestCount,
      },
      userSkills:
        userSkills.length > 0
          ? userSkills.map((us) => ({
              skillName: us.skill.skillName,
              level: us.level,
            }))
          : null,
    };
  }

  /**
   * プロフィール情報更新
   * users_mstテーブルから更新
   * 
   * @param userId: Cognitoのsub（ユーザーID）
   * @param updateProfileRequestDto: プロフィール情報更新リクエストDTO
   * @throws NotFoundException
   */
  async updateProfile(
    userId: string,
    req: updateProfileRequestDto,
  ){
    // プロフィール情報を更新
    await this.prisma.usersMst.update({
      where: { userId },
      data: {
        name: req.name,
        email: req.email,
        profile: req.profile,
        icon: req.icon,
        updatedBy: userId, // 更新者を設定
      },
    });

    // 更新後のデータを取得して返却
    // これにより、フロントエンドで再取得する必要がなくなる
    return this.getUserDetail(userId);
  }
}

