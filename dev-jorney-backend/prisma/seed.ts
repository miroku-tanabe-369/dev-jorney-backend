import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

// Prisma 7では、adapterを使用してPrismaClientを初期化する必要がある
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// シードデータファイルのパス
const SEED_DATA_FILE = path.join(__dirname, 'seed-data.json');

interface SeedData {
  users?: any[];
  levels?: any[];
  skills?: any[];
  skilltrees?: any[];
  nodes?: any[];
  quests?: any[];
  questProgresses?: any[];
  nodeProgresses?: any[];
  skilltreeProgresses?: any[];
  usersSkills?: any[];
  skilltreesNodes?: any[];
  nodeDependencies?: any[];
}

async function main() {
  console.log('🌱 テストデータの登録を開始します...');

  // JSONファイルを読み込む
  if (!fs.existsSync(SEED_DATA_FILE)) {
    console.error(`❌ シードデータファイルが見つかりません: ${SEED_DATA_FILE}`);
    console.log('💡 seed-data.jsonファイルを作成してください。');
    process.exit(1);
  }

  const seedData: SeedData = JSON.parse(
    fs.readFileSync(SEED_DATA_FILE, 'utf-8'),
  );

  // デフォルトの作成者・更新者ID
  const defaultUserId = '00000000-0000-0000-0000-000000000000';

  // ユーザーマスタの登録
  if (seedData.users && seedData.users.length > 0) {
    console.log(`📝 ${seedData.users.length}件のユーザーを登録します...`);
    for (const userData of seedData.users) {
      await prisma.usersMst.upsert({
        where: { email: userData.email },
        update: userData,
        create: {
          ...userData,
          createdBy: userData.createdBy || defaultUserId,
          updatedBy: userData.updatedBy || defaultUserId,
        },
      });
    }
    console.log('✅ ユーザーマスタの登録が完了しました');
  }

  // レベルマスタの登録
  if (seedData.levels && seedData.levels.length > 0) {
    console.log(`📝 ${seedData.levels.length}件のレベルマスタを登録します...`);
    for (const levelData of seedData.levels) {
      await prisma.levelMst.upsert({
        where: { level: levelData.level },
        update: levelData,
        create: {
          ...levelData,
          createdBy: levelData.createdBy || defaultUserId,
          updatedBy: levelData.updatedBy || defaultUserId,
        },
      });
    }
    console.log('✅ レベルマスタの登録が完了しました');
  }

  // スキルマスタの登録
  if (seedData.skills && seedData.skills.length > 0) {
    console.log(`📝 ${seedData.skills.length}件のスキルマスタを登録します...`);
    for (const skillData of seedData.skills) {
      await prisma.skillsMst.upsert({
        where: { skillCode: skillData.skillCode },
        update: skillData,
        create: {
          ...skillData,
          createdBy: skillData.createdBy || defaultUserId,
          updatedBy: skillData.updatedBy || defaultUserId,
        },
      });
    }
    console.log('✅ スキルマスタの登録が完了しました');
  }

  // スキルツリーマスタの登録
  if (seedData.skilltrees && seedData.skilltrees.length > 0) {
    console.log(
      `📝 ${seedData.skilltrees.length}件のスキルツリーマスタを登録します...`,
    );
    for (const skilltreeData of seedData.skilltrees) {
      await prisma.skilltreesMst.upsert({
        where: { skilltreeCode: skilltreeData.skilltreeCode },
        update: skilltreeData,
        create: {
          ...skilltreeData,
          createdBy: skilltreeData.createdBy || defaultUserId,
          updatedBy: skilltreeData.updatedBy || defaultUserId,
        },
      });
    }
    console.log('✅ スキルツリーマスタの登録が完了しました');
  }

  // ノードマスタの登録
  if (seedData.nodes && seedData.nodes.length > 0) {
    console.log(`📝 ${seedData.nodes.length}件のノードマスタを登録します...`);
    for (const nodeData of seedData.nodes) {
      await prisma.nodesMst.upsert({
        where: { nodeCode: nodeData.nodeCode },
        update: nodeData,
        create: {
          ...nodeData,
          createdBy: nodeData.createdBy || defaultUserId,
          updatedBy: nodeData.updatedBy || defaultUserId,
        },
      });
    }
    console.log('✅ ノードマスタの登録が完了しました');
  }

  // クエストマスタの登録
  if (seedData.quests && seedData.quests.length > 0) {
    console.log(`📝 ${seedData.quests.length}件のクエストマスタを登録します...`);
    for (const questData of seedData.quests) {
      await prisma.questMst.upsert({
        where: { questCode: questData.questCode },
        update: questData,
        create: {
          ...questData,
          createdBy: questData.createdBy || defaultUserId,
          updatedBy: questData.updatedBy || defaultUserId,
        },
      });
    }
    console.log('✅ クエストマスタの登録が完了しました');
  }

  // クエスト進捗状況の登録
  if (seedData.questProgresses && seedData.questProgresses.length > 0) {
    console.log(
      `📝 ${seedData.questProgresses.length}件のクエスト進捗状況を登録します...`,
    );
    for (const progressData of seedData.questProgresses) {
      const existing = await prisma.questProgressTran.findUnique({
        where: {
          userId_questCode: {
            userId: progressData.userId,
            questCode: progressData.questCode,
          },
        },
      });

      if (existing) {
        await prisma.questProgressTran.update({
          where: {
            userId_questCode: {
              userId: progressData.userId,
              questCode: progressData.questCode,
            },
          },
          data: progressData,
        });
      } else {
        await prisma.questProgressTran.create({
          data: {
            ...progressData,
            createdBy: progressData.createdBy || defaultUserId,
            updatedBy: progressData.updatedBy || defaultUserId,
          },
        });
      }
    }
    console.log('✅ クエスト進捗状況の登録が完了しました');
  }

  // ノード進捗状況の登録
  if (seedData.nodeProgresses && seedData.nodeProgresses.length > 0) {
    console.log(
      `📝 ${seedData.nodeProgresses.length}件のノード進捗状況を登録します...`,
    );
    for (const progressData of seedData.nodeProgresses) {
      const existing = await prisma.nodeProgressTran.findUnique({
        where: {
          userId_nodeCode: {
            userId: progressData.userId,
            nodeCode: progressData.nodeCode,
          },
        },
      });

      if (existing) {
        await prisma.nodeProgressTran.update({
          where: {
            userId_nodeCode: {
              userId: progressData.userId,
              nodeCode: progressData.nodeCode,
            },
          },
          data: progressData,
        });
      } else {
        await prisma.nodeProgressTran.create({
          data: {
            ...progressData,
            createdBy: progressData.createdBy || defaultUserId,
            updatedBy: progressData.updatedBy || defaultUserId,
          },
        });
      }
    }
    console.log('✅ ノード進捗状況の登録が完了しました');
  }

  // スキルツリー進捗状況の登録
  if (
    seedData.skilltreeProgresses &&
    seedData.skilltreeProgresses.length > 0
  ) {
    console.log(
      `📝 ${seedData.skilltreeProgresses.length}件のスキルツリー進捗状況を登録します...`,
    );
    for (const progressData of seedData.skilltreeProgresses) {
      const existing = await prisma.skilltreeProgressTran.findUnique({
        where: {
          userId_skilltreeCode: {
            userId: progressData.userId,
            skilltreeCode: progressData.skilltreeCode,
          },
        },
      });

      if (existing) {
        await prisma.skilltreeProgressTran.update({
          where: {
            userId_skilltreeCode: {
              userId: progressData.userId,
              skilltreeCode: progressData.skilltreeCode,
            },
          },
          data: progressData,
        });
      } else {
        await prisma.skilltreeProgressTran.create({
          data: {
            ...progressData,
            createdBy: progressData.createdBy || defaultUserId,
            updatedBy: progressData.updatedBy || defaultUserId,
          },
        });
      }
    }
    console.log('✅ スキルツリー進捗状況の登録が完了しました');
  }

  // ユーザー取得スキルの登録
  if (seedData.usersSkills && seedData.usersSkills.length > 0) {
    console.log(
      `📝 ${seedData.usersSkills.length}件のユーザー取得スキルを登録します...`,
    );
    for (const userSkillData of seedData.usersSkills) {
      const existing = await prisma.usersSkillsTran.findUnique({
        where: {
          userId_skillCode: {
            userId: userSkillData.userId,
            skillCode: userSkillData.skillCode,
          },
        },
      });

      if (existing) {
        await prisma.usersSkillsTran.update({
          where: {
            userId_skillCode: {
              userId: userSkillData.userId,
              skillCode: userSkillData.skillCode,
            },
          },
          data: userSkillData,
        });
      } else {
        await prisma.usersSkillsTran.create({
          data: {
            ...userSkillData,
            createdBy: userSkillData.createdBy || defaultUserId,
            updatedBy: userSkillData.updatedBy || defaultUserId,
          },
        });
      }
    }
    console.log('✅ ユーザー取得スキルの登録が完了しました');
  }

  // スキルツリーノードの登録
  if (seedData.skilltreesNodes && seedData.skilltreesNodes.length > 0) {
    console.log(
      `📝 ${seedData.skilltreesNodes.length}件のスキルツリーノードを登録します...`,
    );
    for (const nodeData of seedData.skilltreesNodes) {
      const existing = await prisma.skilltreesNodeTran.findUnique({
        where: {
          skilltreeCode_nodeCode: {
            skilltreeCode: nodeData.skilltreeCode,
            nodeCode: nodeData.nodeCode,
          },
        },
      });

      if (existing) {
        await prisma.skilltreesNodeTran.update({
          where: {
            skilltreeCode_nodeCode: {
              skilltreeCode: nodeData.skilltreeCode,
              nodeCode: nodeData.nodeCode,
            },
          },
          data: nodeData,
        });
      } else {
        await prisma.skilltreesNodeTran.create({
          data: {
            ...nodeData,
            createdBy: nodeData.createdBy || defaultUserId,
            updatedBy: nodeData.updatedBy || defaultUserId,
          },
        });
      }
    }
    console.log('✅ スキルツリーノードの登録が完了しました');
  }

  // ノード依存関係の登録
  if (seedData.nodeDependencies && seedData.nodeDependencies.length > 0) {
    console.log(
      `📝 ${seedData.nodeDependencies.length}件のノード依存関係を登録します...`,
    );
    for (const dependencyData of seedData.nodeDependencies) {
      const existing = await prisma.nodeDependenciesTran.findUnique({
        where: {
          prerequisiteNodeCode_dependentNodeCode: {
            prerequisiteNodeCode: dependencyData.prerequisiteNodeCode,
            dependentNodeCode: dependencyData.dependentNodeCode,
          },
        },
      });

      if (existing) {
        await prisma.nodeDependenciesTran.update({
          where: {
            prerequisiteNodeCode_dependentNodeCode: {
              prerequisiteNodeCode: dependencyData.prerequisiteNodeCode,
              dependentNodeCode: dependencyData.dependentNodeCode,
            },
          },
          data: dependencyData,
        });
      } else {
        await prisma.nodeDependenciesTran.create({
          data: {
            ...dependencyData,
            createdBy: dependencyData.createdBy || defaultUserId,
            updatedBy: dependencyData.updatedBy || defaultUserId,
          },
        });
      }
    }
    console.log('✅ ノード依存関係の登録が完了しました');
  }


  console.log('🎉 テストデータの登録が完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
