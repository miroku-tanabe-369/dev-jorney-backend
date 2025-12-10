/**
 * ユーザー基本情報DTO
 * users_mstテーブルから取得
 */
export class UserDetailInfoDto {
  name: string;
  email: string;
  profile: string | null;
  icon: string | null;
  currentLevel: number;
  totalSkillPoint: number;
  completedQuestCount: number;
}

/**
 * ユーザー保有スキルDTO
 * users_skills_tranテーブルから取得
 */
export class UserSkillInfoDto {
  skillName: string;
  level: string;
}

export class UserDetailResponseDto {
  userDetail: UserDetailInfoDto;
  userSkills: UserSkillInfoDto[] | null;
}