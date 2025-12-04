-- CreateTable
CREATE TABLE "users_mst" (
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "profile" VARCHAR(500),
    "s3_object_key" VARCHAR(255),
    "current_level" INTEGER NOT NULL,
    "total_exp" INTEGER NOT NULL,
    "total_skill_point" INTEGER NOT NULL,
    "completed_quest_count" INTEGER NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP,
    "deleted_by" CHAR(36),

    CONSTRAINT "users_mst_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "skills_mst" (
    "skill_code" VARCHAR(255) NOT NULL,
    "skill_name" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_mst_pkey" PRIMARY KEY ("skill_code")
);

-- CreateTable
CREATE TABLE "skilltrees_mst" (
    "skilltree_code" VARCHAR(255) NOT NULL,
    "skilltree_name" VARCHAR NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skilltrees_mst_pkey" PRIMARY KEY ("skilltree_code")
);

-- CreateTable
CREATE TABLE "nodes_mst" (
    "node_code" VARCHAR(255) NOT NULL,
    "node_name" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodes_mst_pkey" PRIMARY KEY ("node_code")
);

-- CreateTable
CREATE TABLE "quest_mst" (
    "quest_code" VARCHAR(255) NOT NULL,
    "node_code" VARCHAR(255) NOT NULL,
    "quest_name" VARCHAR NOT NULL,
    "quest_detail" VARCHAR(500) NOT NULL,
    "exp" INTEGER NOT NULL,
    "skill_point" INTEGER NOT NULL,
    "difficulty" VARCHAR(255) NOT NULL,
    "recommended_time" VARCHAR(255) NOT NULL,
    "learning_objectives" JSONB NOT NULL,
    "achievement_conditions" JSONB NOT NULL,
    "checklist_items" JSONB NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_mst_pkey" PRIMARY KEY ("quest_code")
);

-- CreateTable
CREATE TABLE "level_mst" (
    "level" INTEGER NOT NULL,
    "required_exp" INTEGER NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_mst_pkey" PRIMARY KEY ("level")
);

-- CreateTable
CREATE TABLE "users_skills_tran" (
    "user_id" UUID NOT NULL,
    "skill_code" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_skills_tran_pkey" PRIMARY KEY ("user_id","skill_code")
);

-- CreateTable
CREATE TABLE "skilltrees_node_tran" (
    "skilltree_code" VARCHAR(255) NOT NULL,
    "node_code" VARCHAR(255) NOT NULL,
    "node_order" INTEGER NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skilltrees_node_tran_pkey" PRIMARY KEY ("skilltree_code","node_code")
);

-- CreateTable
CREATE TABLE "node_dependencies_tran" (
    "prerequisite_node_code" VARCHAR(255) NOT NULL,
    "dependent_node_code" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "node_dependencies_tran_pkey" PRIMARY KEY ("prerequisite_node_code","dependent_node_code")
);

-- CreateTable
CREATE TABLE "quest_progress_tran" (
    "user_id" UUID NOT NULL,
    "quest_code" VARCHAR(255) NOT NULL,
    "progress" INTEGER NOT NULL,
    "status_code" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_progress_tran_pkey" PRIMARY KEY ("user_id","quest_code")
);

-- CreateTable
CREATE TABLE "node_progress_tran" (
    "user_id" UUID NOT NULL,
    "node_code" VARCHAR(255) NOT NULL,
    "progress" INTEGER NOT NULL,
    "status_code" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "node_progress_tran_pkey" PRIMARY KEY ("user_id","node_code")
);

-- CreateTable
CREATE TABLE "skilltree_progress_tran" (
    "user_id" UUID NOT NULL,
    "skilltree_code" VARCHAR(255) NOT NULL,
    "progress" INTEGER NOT NULL,
    "status_code" VARCHAR(255) NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skilltree_progress_tran_pkey" PRIMARY KEY ("user_id","skilltree_code")
);

-- CreateTable
CREATE TABLE "managed_checklist_tran" (
    "user_id" UUID NOT NULL,
    "quest_code" VARCHAR(255) NOT NULL,
    "progress_detail" BOOLEAN NOT NULL,
    "created_by" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "managed_checklist_tran_pkey" PRIMARY KEY ("user_id","quest_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_mst_email_key" ON "users_mst"("email");

-- CreateIndex
CREATE INDEX "users_mst_deleted_at_idx" ON "users_mst"("deleted_at");

-- AddForeignKey
ALTER TABLE "quest_mst" ADD CONSTRAINT "quest_mst_node_code_fkey" FOREIGN KEY ("node_code") REFERENCES "nodes_mst"("node_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_skills_tran" ADD CONSTRAINT "users_skills_tran_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_mst"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_skills_tran" ADD CONSTRAINT "users_skills_tran_skill_code_fkey" FOREIGN KEY ("skill_code") REFERENCES "skills_mst"("skill_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skilltrees_node_tran" ADD CONSTRAINT "skilltrees_node_tran_skilltree_code_fkey" FOREIGN KEY ("skilltree_code") REFERENCES "skilltrees_mst"("skilltree_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skilltrees_node_tran" ADD CONSTRAINT "skilltrees_node_tran_node_code_fkey" FOREIGN KEY ("node_code") REFERENCES "nodes_mst"("node_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_dependencies_tran" ADD CONSTRAINT "node_dependencies_tran_prerequisite_node_code_fkey" FOREIGN KEY ("prerequisite_node_code") REFERENCES "nodes_mst"("node_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_dependencies_tran" ADD CONSTRAINT "node_dependencies_tran_dependent_node_code_fkey" FOREIGN KEY ("dependent_node_code") REFERENCES "nodes_mst"("node_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_progress_tran" ADD CONSTRAINT "quest_progress_tran_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_mst"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_progress_tran" ADD CONSTRAINT "quest_progress_tran_quest_code_fkey" FOREIGN KEY ("quest_code") REFERENCES "quest_mst"("quest_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_progress_tran" ADD CONSTRAINT "node_progress_tran_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_mst"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_progress_tran" ADD CONSTRAINT "node_progress_tran_node_code_fkey" FOREIGN KEY ("node_code") REFERENCES "nodes_mst"("node_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skilltree_progress_tran" ADD CONSTRAINT "skilltree_progress_tran_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_mst"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skilltree_progress_tran" ADD CONSTRAINT "skilltree_progress_tran_skilltree_code_fkey" FOREIGN KEY ("skilltree_code") REFERENCES "skilltrees_mst"("skilltree_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managed_checklist_tran" ADD CONSTRAINT "managed_checklist_tran_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_mst"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managed_checklist_tran" ADD CONSTRAINT "managed_checklist_tran_quest_code_fkey" FOREIGN KEY ("quest_code") REFERENCES "quest_mst"("quest_code") ON DELETE CASCADE ON UPDATE CASCADE;
