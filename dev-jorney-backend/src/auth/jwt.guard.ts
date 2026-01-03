import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

//AuthGuard('jwt')の引数の値は
//jwt.strategy.tsのPassportStrategyの引数の値と一致させる
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtGuard.name);

    //Reflector：デコレータで設定されたメタデータを実行コンテキストから読み取るために利用する
    constructor(private reflector: Reflector) {
        super();
    }

    /**
     * 認証チェックを実行する前に、@Public()デコレータが設定されているかチェック
     * @Public()が設定されている場合は認証をスキップ
     */

    //contest: ExecutionContext -> 現在処理しようとしているリクエストに関する情報を保持している
    canActivate(context: ExecutionContext) {
        // Reflectorを使ってIS_PUBLIC_KEYメタデータを取得
        //contextとして渡された2つのターゲットから探す。(ハンドラメソッドとコントローラクラス）
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // @Public()デコレータが設定されている場合は認証をスキップ
        if (isPublic) {
            this.logger.debug('Public endpoint, skipping authentication');
            return true;
        }

        // リクエスト情報を取得
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers?.authorization;
        
        this.logger.log('=== JWT Authentication Check ===');
        this.logger.log(`Request URL: ${request.url}`);
        this.logger.log(`Request Method: ${request.method}`);
        this.logger.log(`Authorization header present: ${!!authorization}`);
        if (authorization) {
            this.logger.log(`Authorization header prefix: ${authorization.substring(0, 30)}...`);
            this.logger.log(`Is Bearer token: ${authorization.startsWith('Bearer ')}`);
            
            // トークンをデコードしてaudクレームを確認（デバッグ用）
            try {
                const token = authorization.replace('Bearer ', '');
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                    this.logger.log(`Token aud (audience): ${payload.aud || 'not found'}`);
                    this.logger.log(`Token iss (issuer): ${payload.iss || 'not found'}`);
                    this.logger.log(`Token sub: ${payload.sub || 'not found'}`);
                    this.logger.log(`Token exp: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'not found'}`);
                }
            } catch (e) {
                this.logger.warn('Failed to decode token for debugging:', e);
            }
        } else {
            this.logger.warn('❌ Authorization header not found in request');
        }

        // それ以外の場合は通常の認証チェックを実行
        // @Public()が設定されていない場合、親クラス(AuthGuard('jwt'))のcanActivateメソッドが実行される
        return super.canActivate(context);
    }

    /**
     * 認証エラーをハンドルする
     * 親クラスのhandleRequestメソッドをオーバーライドして、エラーの詳細をログに記録
     */
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        
        if (err) {
            this.logger.error('=== JWT Authentication Error ===');
            this.logger.error(`Error type: ${err.constructor?.name || typeof err}`);
            this.logger.error(`Error message: ${err.message || String(err)}`);
            this.logger.error(`Request URL: ${request.url}`);
            this.logger.error(`Request Method: ${request.method}`);
            this.logger.error(`Authorization header: ${request.headers?.authorization ? request.headers.authorization.substring(0, 50) + '...' : 'not found'}`);
            this.logger.error('================================');
            throw err;
        }

        if (!user) {
            this.logger.error('=== JWT Authentication Failed ===');
            this.logger.error(`Info: ${JSON.stringify(info)}`);
            this.logger.error(`Request URL: ${request.url}`);
            this.logger.error(`Request Method: ${request.method}`);
            this.logger.error(`Authorization header: ${request.headers?.authorization ? request.headers.authorization.substring(0, 50) + '...' : 'not found'}`);
            
            // infoオブジェクトの内容を詳細にログ出力
            if (info) {
                this.logger.error(`Info type: ${info.constructor?.name || typeof info}`);
                this.logger.error(`Info message: ${info.message || String(info)}`);
                if (info.name) {
                    this.logger.error(`Info name: ${info.name}`);
                }
            }
            this.logger.error('================================');
            throw new UnauthorizedException('JWT authentication failed');
        }

        this.logger.log(`✅ JWT Authentication successful for user: ${user.sub || 'unknown'}`);
        return user;
    }

        //学習で躓いたポイント
        // 【Q3】super.canActivate(context)からどのようにJwtStrategyのvalidateメソッドが呼び出されるのか？
        // 1.super.canActivate(context) の実行
        // 2.AuthGuardの起動。このガードのコアロジックはPassport.jsの認証機能をNestJSの実行コンテキストに適合させること
        // 3.Strategyの実行。AuthGuardは自身コンストラクタで指定された戦略名('jwt')に基づいてPassport.jsの認証パイプラインを起動する。
        // 4.JwtStrategyクラスのインスタンスを見つけ出し、その認証ロジックを実行する。
        
        // まとめ
        // AuthGuard('jwt').canActivate() の処理を一言で表すと、「Passport.jsの認証ロジックを実行し、成功すればユーザー情報をリクエストに格納して true を返し、失敗すれば 401 エラーを発生させてリクエストを中断する」という処理です。
        // JwtGuard は、この強力な認証機能に「@Public() が設定されている場合のスキップ処理」という前処理を追加している、という構造になっています。
}

// app.module.tsで使用するためのエイリアス
export const AuthorizerGuard = JwtGuard;