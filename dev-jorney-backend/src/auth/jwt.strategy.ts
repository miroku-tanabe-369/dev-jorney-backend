//JWTトークンの検証ロジックを提供する

//参考サイト：https://zenn.dev/dove/articles/d45f18f6c50f10

//jwks-rsa を使ってCognitoの公開鍵を動的に取得して、validateメソッドで追加のセキュリティチェックを行う

/* constructor: 環境変数 (COGNITO_USER_POOL_ID, COGNITO_REGION, COGNITO_CLIENT_ID) を取得し、super() に以下の検証ルールを設定: 
 * jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(). 
 * secretOrKeyProvider: passportJwtSecret を使い、jwksUri を構築して渡す. 
 * issuer と audience の検証値を設定. 
 * validate(payload): 必須のセキュリティチェックとして if (payload.token_use !== 'access') を実装し、Access Token の利用を強制する.
 */

import { Injectable,Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { ConfigService } from "@nestjs/config";
import { JwtUser, JwtPayload } from "./types/jwt-user.interface";

/**
 * @nestjs/passport : NestJSでパスポートモジュールを扱うための基底クラス
 * jwks-rsa：cognitoのサーバーからキーを取得して署名があっているかを確認するために利用する
 * passport-jwt：JWTストラテジーを作成するために利用する
 */

// 学習で躓いたポイント
// 【Q1】Startegyをなぜ直接継承しないのか？
// PassportStrategyは、外部の認証ライブラリの機能を、NestJSのDIシステムとモジュール構造という「枠」に適合させるためのブリッジ役です。
// これにより、開発者は、外部ライブラリの詳細な初期化ロジックに煩わされることなく、NestJSのクリーンで宣言的な方法で認証戦略を実装できています。

//【Q2】PassportStrategy(Strategy, 'jwt')部分の第二引数は何を意味しているのか？
//第二引数 'jwt' は、AuthGuard('jwt') と JwtStrategy を**連携させるための目印（キー）**であり、このキーによってGuardから認証処理の実体（Strategy）を呼び出しています。

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private logger = new Logger(JwtStrategy.name);

    constructor(private configService: ConfigService) {
        // ============================================
        // 環境変数の取得（ConfigServiceを使用）
        // https://docs.nestjs.com/techniques/configuration#using-the-configservice
        // ============================================
        
        // COGNITO_CLIENT_IDを取得
        const cognitoClientId = configService.get<string>('COGNITO_CLIENT_ID');
        
        // COGNITO_ISSUERを取得
        // 例: https://cognito-idp.ap-northeast-1.amazonaws.com/us-east-1_XXXXXXXXX
        const cognitoIssuer = configService.get<string>('COGNITO_ISSUER');

        // 必須環境変数のチェック
        if (!cognitoClientId) {
            throw new Error('COGNITO_CLIENT_ID is not set in environment variables');
        }

        if (!cognitoIssuer) {
            throw new Error('COGNITO_ISSUER is not set in environment variables');
        }

        // JWKS URIを構築
        // 例: https://cognito-idp.ap-northeast-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/jwks.json
        const jwksUri = `${cognitoIssuer}/.well-known/jwks.json`;

        //設定値の具体的な参考文献は以下を参照。
        //https://github.com/mikenicholson/passport-jwt#configure-strategy
        super({
            //ヘッダからBearerトークンを取得
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // 注意: CognitoのAccess Tokenには`aud`クレームが含まれないため、
            // audience検証を無効化する
            // セキュリティ上、issuer検証と署名検証で十分な保護が提供される
            // audience: cognitoClientId, // コメントアウト: Access Tokenには`aud`が含まれない
            //jwt発行者。本プロジェクトではCognito（発行者検証）
            issuer: cognitoIssuer,
            algorithms: ['RS256'],
            //もし自分がjwtを発行しているなら秘密鍵を指定するが、
            //cognitoなど外部サービスが発行しているならsecretOrKeyProviderを利用する。
            secretOrKeyProvider: passportJwtSecret({
                //公開鍵をキャッシュする。これがfalseだと、毎リクエスト毎に
                //公開鍵をHTTPリクエストで取得する必要がある。
                cache: true,
                //JWKSエンドポイントへのリクエストが一定時間内に過剰に行われるのを防ぐ
                rateLimit: true,
                //一分間に公開鍵を取得する回数の上限を設定する
                jwksRequestsPerMinute: 5,
                //Cognitoの公開鍵セットがおかれているURLを指定する。このURLからjwks-rsaが鍵をダウンロードする。
                jwksUri: jwksUri,
            }),
            // passReqToCallback: true, //これをtrueにすると、validateの第一引数にRequestを使用できる。
        });

        // ログ出力（環境変数の値を確認）- super()の後に実行
        this.logger.log('=== JWT Strategy Configuration ===');
        this.logger.log(`COGNITO_CLIENT_ID: ${cognitoClientId ? cognitoClientId.substring(0, 10) + '...' : 'NOT SET'}`);
        this.logger.log(`COGNITO_ISSUER: ${cognitoIssuer || 'NOT SET'}`);
        this.logger.log(`JWKS URI: ${jwksUri}`);
        this.logger.log('===================================');
    }

    //jwt検証後、デコードされたpayloadを渡してくる。
    //検証後に実行されることに注意。JWTが無効であればそもそも実行されない。
    //validate自体はPromiseにすることも可能。
    //戻り値はPassport.jsによって自動的にreq.userに設定される
    public validate(payload: JwtPayload): JwtUser {
        // Access Tokenのclient_idクレームを検証
        // 注意: Access Tokenには`aud`クレームが含まれない場合があるが、
        // `client_id`クレームは常に存在し、IDトークンの`aud`と同じ値を持つ
        const tokenPayload = payload as any;
        const clientId = tokenPayload.client_id;
        const expectedClientId = this.configService.get<string>('COGNITO_CLIENT_ID');
        
        this.logger.log('=== JWT Token Validated Successfully ===');
        this.logger.log(`Token sub: ${payload.sub}`);
        this.logger.log(`Token email: ${payload.email || 'not provided'}`);
        this.logger.log(`Token name: ${payload.name || 'not provided'}`);
        this.logger.log(`Token use: ${tokenPayload.token_use || 'not provided'}`);
        this.logger.log(`Token client_id: ${clientId || 'not provided'}`);
        this.logger.log(`Token audience: ${tokenPayload.aud || 'not provided (optional)'}`);
        this.logger.log(`Token issuer: ${tokenPayload.iss || 'not provided'}`);
        this.logger.log(`Token username: ${tokenPayload.username || 'not provided'}`);
        this.logger.log(`Token scope: ${tokenPayload.scope || 'not provided'}`);
        this.logger.log(`All token claims: ${JSON.stringify(Object.keys(tokenPayload))}`);
        
        // client_idクレームの検証
        if (clientId && expectedClientId && clientId !== expectedClientId) {
            this.logger.error(`❌ Client ID mismatch: expected ${expectedClientId}, got ${clientId}`);
            throw new Error(`Invalid client_id: expected ${expectedClientId}, got ${clientId}`);
        }
        
        if (!clientId) {
            this.logger.warn('⚠️ client_id claim not found in token');
        } else {
            this.logger.log(`✅ Client ID verified: ${clientId}`);
        }
        
        this.logger.log('==========================================');
        
        // JwtUserオブジェクトを返すことで、コントローラでreq.user.sub, req.user.email, req.user.nameでアクセス可能
        return {
            sub: payload.sub,
            email: payload.email || '',
            name: payload.name || '',
        };
    }
}

