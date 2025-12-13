/**
 * プロフィール情報更新処理
 * users_mstテーブルから更新
 */

export class updateProfileRequestDto {
    name: string;
    email: string;
    profile: string | null;
    icon: string | null;
}