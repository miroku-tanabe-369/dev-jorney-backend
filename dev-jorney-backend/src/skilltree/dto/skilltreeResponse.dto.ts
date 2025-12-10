/** 
* スキルツリー基本情報DTO
* skilltrees_mstテーブルから取得
* skilltreeProgressTranテーブルから取得
**/
export class skilltreeInfoDto {
    skilltreeName: string;
    progress: number;
    statusCode: string;
}

/**
 * ノード基本情報DTO
 * nodes_mstテーブルから取得
 * skilltrees_node_tranテーブルから取得
 * nodeProgressTranテーブルから取得
 */
export class nodeInfoDto {
    nodeCode: string;
    nodeName: string;
    nodeOrder: number;
    progress: number;
    statusCode: string;
}

/**
 * 各ノード配下のクエストの一覧を取得する   
 * quest_mstテーブルから取得    
 * quest_progress_tranテーブルから取得
 */
export class questInfoDto {
    questCode: string;
    questName: string;
    questOrder: number;
    questDetail: string;
    exp: number;
    skillPoint: number;
    difficulty: string;
    progress: number;
    statusCode: string;
}

export class SkilltreeResponseDto {
    skilltreeInfo: skilltreeInfoDto;
    nodes: nodeInfoDto[];
    quests: questInfoDto[];
}

