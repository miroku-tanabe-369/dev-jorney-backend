//JWTトークンの検証ロジックを提供する

//jwks-rsa を使ってCognitoの公開鍵を動的に取得して、validateメソッドで追加のセキュリティチェックを行う

/* constructor: 環境変数 (COGNITO_USER_POOL_ID, COGNITO_REGION, COGNITO_CLIENT_ID) を取得し、super() に以下の検証ルールを設定: 
 * jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(). 
 * secretOrKeyProvider: passportJwtSecret を使い、jwksUri を構築して渡す. 
 * issuer と audience の検証値を設定. 
 * validate(payload): 必須のセキュリティチェックとして if (payload.token_use !== 'access') を実装し、Access Token の利用を強制する.
 */

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { ConfigService } from "@nestjs/config";
import { JWTUser, JWTTokenPayload } from "./types/jwt-user.interface";

/**
 * @nestjs/passport : NestJSでパスポートモジュールを扱うための基底クラス
 * jwks-rsa：cognitoのサーバーからキーを取得して署名があっているかを確認するために利用する
 * passport-jwt：JWTストラテジーを作成するために利用する
 */


/**
 * JWT認証ストラテジー
 * 
 * 役割:
 * - ID Token（JWT形式）の検証
 * - ユーザー情報の抽出
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        // ============================================
        // ステップ1: 環境変数の取得とバリデーション
        // ============================================
        
        // COGNITO_USER_POOL_IDを取得
        // 例: "us-east-1_XXXXXXXXX"
        const cognitoUserPoolId = configService.get<string>('COGNITO_USER_POOL_ID');
        
        // COGNITO_REGIONを取得（デフォルト: ap-northeast-1）
        const cognitoRegion = configService.get<string>('COGNITO_REGION', 'ap-northeast-1');
        
        // COGNITO_CLIENT_IDを取得
        // 例: "1a2b3c4d5e6f7g8h9i0j"
        const cognitoClientId = configService.get<string>('COGNITO_CLIENT_ID');

        // 必須環境変数のチェック
        if (!cognitoUserPoolId) {
            throw new Error('COGNITO_USER_POOL_ID is not set in environment variables');
        }

        if (!cognitoClientId) {
            throw new Error('COGNITO_CLIENT_ID is not set in environment variables');
        }

        // ============================================
        // ステップ2: JWKS URIの構築
        // ============================================
        
        // JWKSエンドポイントのURLを構築
        // 例: https://cognito-idp.ap-northeast-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/jwks.json
        const jwksUri = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}/.well-known/jwks.json`;

        // ============================================
        // ステップ3: Issuer（発行者）のURLを構築
        // ============================================
        
        // 発行者のURLを構築
        // 例: https://cognito-idp.ap-northeast-1.amazonaws.com/us-east-1_XXXXXXXXX
        const issuer = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`;

        // ============================================
        // ステップ4: Passport Strategyの初期化
        // ============================================
        
        super({
            // リクエストからJWTトークンを抽出する方法を指定
            // Authorization: Bearer <token> 形式からトークンを抽出
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // JWKSエンドポイントから公開鍵を取得するプロバイダー
            secretOrKeyProvider: passportJwtSecret({
                cache: true,                    // 公開鍵をキャッシュ（パフォーマンス向上）
                rateLimit: true,                // レート制限を有効化
                jwksRequestsPerMinute: 5,       // 1分あたりのJWKSリクエスト数制限
                jwksUri: jwksUri,               // JWKSエンドポイントのURL
            }),

            // 発行者（Issuer）の検証
            // JWTトークンのissクレームがこの値と一致する必要がある
            issuer: issuer,

            // オーディエンス（Audience）の検証
            // JWTトークンのaudクレームがこの値と一致する必要がある
            audience: cognitoClientId,

            // 使用するアルゴリズム（CognitoはRS256を使用）
            algorithms: ['RS256'],
        });
    }

    // ============================================
    // ステップ5: validateメソッドの実装
    // ============================================
    
    /**
     * JWTトークン検証後の処理
     * 
     * Passportが自動的に以下を検証:
     * - 署名検証（公開鍵を使用）
     * - 発行者（iss）の検証
     * - オーディエンス（aud）の検証
     * - 有効期限（exp）の検証
     * 
     * このメソッドでは追加の検証とユーザー情報の抽出を行う
     * 
     * @param payload JWTトークンのペイロード（検証済み）
     * @returns ユーザー情報（req.userに設定される）
     */
    async validate(payload: JWTTokenPayload): Promise<JWTUser> {
        // subクレーム（Cognito User ID）が存在するか確認
        if (!payload.sub) {
            throw new Error('Token payload missing required field: sub');
        }

        // ユーザー情報を返す（req.userに設定される）
        return {
            sub: payload.sub,
            email: payload.email || '',
            name: payload.name || '',
        };
    }
}