import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkilltreeResponseDto } from './dto/skilltreeResponse.dto';

@Injectable()
export class SkilltreesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 
   * スキルツリーの描画に必要な情報を取得する
   * 
   * @param skilltreeCode 
   * @param userId 
   * @returns SkilltreeResponseDto
   * @throws Error
   */
  async getSkilltree(skilltreeCode: string, userId: string): Promise<SkilltreeResponseDto> {
    // スキルツリーマスタとリレーション（子テーブル）のデータを取得
    // selectでリレーション名を指定することで、子テーブルのデータを取得できます
    // マスタデータ（skilltreesMst）を取得し、特定のuserIdの進捗があるものは進捗情報を含める
    // 進捗がないスキルツリーも含めて取得する（進捗がない場合はデフォルト値を設定）
    const skilltree = await this.prisma.skilltreesMst.findUnique({
      where: {
        skilltreeCode: skilltreeCode,
      },
      select: {
        skilltreeCode: true,
        skilltreeName: true,
        // リレーション名を指定して子テーブルのデータを取得
        skilltreeProgresses: {
          where: {
            userId: userId,
          },
          select: {
            progress: true,
            statusCode: true,
          },
        },
        skilltreeNodes: {
          select: {
            nodeCode: true,
          }
        },
      },
    });

    // skilltreeNodesは配列なので、nodeCodeの配列を抽出
    // nodeList取得処理のin句で仕様するが、skilltreeから直接アクセスできないので、nodeCodesを抽出しておく
    const nodeCodes = skilltree?.skilltreeNodes.map((node) => node.nodeCode) || [];

    // スキルツリー配下のノードの進捗状況を取得する
    // nodeCode配列に含まれるすべてのノードを取得し、
    // その中で特定のuserIdの進捗があるものは進捗情報を含める
    // 
    // 注意: nodeProgressesの条件を削除することで、すべてのノードを取得する
    // 進捗情報はselect内のwhereでフィルタリングされるため、他のユーザーの進捗は含まれない
    const nodeList = await this.prisma.nodesMst.findMany({
      where: {
        nodeCode: {
          in: nodeCodes
        },
      },
      select: {
        nodeCode: true,
        nodeName: true,
        skilltreeNodes: {
          select: {
            nodeOrder: true,
          }
        },
        nodeProgresses: {
          where: {
            userId: userId,
          },
          select: {
            progress: true,
            statusCode: true,
          }
        },
      },
    });

    // nodeListに紐づくクエストの情報を取得する
    // マスタデータ（questMst）を取得し、特定のuserIdの進捗があるものは進捗情報を含める
    // 進捗がないクエストも含めて取得する（進捗がない場合はデフォルト値を設定）
    //
    // 注意: questProgressesの条件を削除することで、すべてのクエストを取得する
    // 進捗情報はselect内のwhereでフィルタリングされるため、他のユーザーの進捗は含まれない
    const questList = await this.prisma.questMst.findMany({
      where: {
        nodeCode: {
          in: nodeCodes
        },
      },
      select: {
        questCode: true,
        questOrder: true,
        questName: true,
        questDetail: true,
        exp: true,
        skillPoint: true,
        difficulty: true,
        questProgresses: {
          where: {
            userId: userId,
          },
          select: {
            progress: true,
            statusCode: true,
          }
        }
      }
    })

    if (!skilltree) {
      throw new Error(`Skilltree with code ${skilltreeCode} not found`);
    }

    return {
      skilltreeInfo: {
        skilltreeName: skilltree.skilltreeName,
        progress: skilltree.skilltreeProgresses[0]?.progress ?? 0,
        statusCode: skilltree.skilltreeProgresses[0]?.statusCode ?? 'NOT_STARTED',
      },
      nodes: nodeList.map((node) => ({
        nodeCode: node.nodeCode,
        nodeName: node.nodeName,
        nodeOrder: node.skilltreeNodes[0]?.nodeOrder ?? 0,
        progress: node.nodeProgresses[0]?.progress ?? 0,
        statusCode: node.nodeProgresses[0]?.statusCode ?? 'NOT_STARTED',
      })),
      quests: questList.map((quest) => ({
        questCode: quest.questCode,
        questName: quest.questName,
        questOrder: quest.questOrder,
        questDetail: quest.questDetail,
        exp: quest.exp,
        skillPoint: quest.skillPoint,
        difficulty: quest.difficulty,
        progress: quest.questProgresses[0]?.progress ?? 0,
        statusCode: quest.questProgresses[0]?.statusCode ?? 'NOT_STARTED',
      })),
    }
  }
}

