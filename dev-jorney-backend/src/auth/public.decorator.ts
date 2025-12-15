import { SetMetadata } from '@nestjs/common';

/**
 * 認証不要なエンドポイントをマークするためのメタデータキー
 * 
 * このキーを使って、ガードでメタデータを検索します
 */
export const IS_PUBLIC_KEY = 'isPublic';


/**
 * 1.＠Public()デコレータを使用して、認証不要なAPIのハンドラ(メソッド)やコントローラクラスに特別な目印(メタデータ)を付ける。
 * 2.JwrGuardが動作する直前に、Reflectorを使用してその目印が設定されているかを調べる。
 * 3.目印があれば、JwtGuardは認証処理をスキップしてリクエストを許可する。
 * 4.目印が無ければ通常通りCognitoで発行されたJWT検証処理を実行する。
 */

/**
 * 認証不要デコレータ
 * 
 * 使用方法:
 * @Public()
 * @Get('health')
 * getHealth() {
 *   return { status: 'ok' };
 * }
 * 
 * このデコレータが設定されたエンドポイントは、JWT Guardが認証チェックをスキップします。
 * 
 * 実装の仕組み:
 * 1. SetMetadataでメタデータを設定（IS_PUBLIC_KEY = true）
 * 2. ガードでReflectorを使ってメタデータを読み取り
 * 3. メタデータがあれば認証をスキップ
 */

//＠Public()デコレータの実態定義
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
