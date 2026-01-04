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
            return true;
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
        if (err) {
            throw err;
        }

        if (!user) {
            throw new UnauthorizedException('JWT authentication failed');
        }

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