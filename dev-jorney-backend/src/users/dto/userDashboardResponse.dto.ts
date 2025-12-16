/**
 * ユーザー基本情報DTO
 * users_mstテーブルから取得
 */
export class UserInfoDto {
  name: string;
  currentLevel: number;
  progress: number; //現在のレベルの進捗度（0~100）
  requiredExp: number; // 次のレベルに必要な経験値
  totalSkillPoint: number;
  completedQuestCount: number;
}

/**
 * 進行中クエスト情報DTO
 * quest_mst, quest_progress_tranテーブルから取得
 */
export class progressQuestInfoDto {
    questCode: string;
    questName: string;
    questDetail: string;
    progress: number;
    recommendedTime: string;
    skillPoint: number;
}

/**
 * 最新完了済みクエスト情報DTO
 * quest_progress_tranテーブルから取得
 */
export class LatestCompletedQuestInfoDto {
    questCode: string;
    questName: string;
    skillPoint: number;
    completedAt: Date;
}

/**
 * ダッシュボード用の概要情報DTO
 * プロフィール詳細よりも軽量な情報を返す
 * 3つの異なるデータグループを統合
 */
export class UserDashboardResponseDto {
  // ユーザー基本情報関連データ（users_mstテーブル）
  userInfo: UserInfoDto;

  // 進行中クエスト情報（進行中のクエストがない場合はnull）
  currentQuest: progressQuestInfoDto | null;

  // 最新完了済みクエスト情報
  latestCompletedQuests: LatestCompletedQuestInfoDto[] | null;
}

