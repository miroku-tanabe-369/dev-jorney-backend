/**
 * JWTユーザーの型定義
 */
export interface JwtUser {
    sub: string;
    email: string;
    name: string;
}

/**
 * JWTトークンのペイロード定義
 */
export interface JwtPayload {
    sub: string;
    email?: string;
    name?: string;
    exp: number;
    iss: string;
    aud: string;
    [key: string]: any; // その他のCognito標準クレーム
}
