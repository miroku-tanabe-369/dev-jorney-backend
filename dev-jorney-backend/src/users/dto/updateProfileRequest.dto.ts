/**
 * プロフィール情報更新処理
 * users_mstテーブルから更新
 */

import { IsString, IsEmail, IsOptional, MaxLength, ValidateIf } from 'class-validator';

export class updateProfileRequestDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsEmail()
    @MaxLength(255)
    email: string;

    @IsOptional()
    @ValidateIf((o) => o.profile !== null && o.profile !== undefined)
    @IsString()
    @MaxLength(500)
    profile?: string | null;

    @IsOptional()
    @ValidateIf((o) => o.icon !== null && o.icon !== undefined)
    @IsString()
    icon?: string | null;
}