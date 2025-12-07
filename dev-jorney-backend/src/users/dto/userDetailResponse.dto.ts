export class UserDetailResponseDto {
  name: string;
  email: string;
  profile: string | null;
  icon: string | null;
  currentLevel: number;
  totalExp: number;
  totalSkillPoint: number;
  completedQuestCount: number;
}