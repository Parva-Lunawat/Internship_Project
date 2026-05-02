import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentModerationStatus20260502190000 implements MigrationInterface {
  name = 'AddCommentModerationStatus20260502190000';

  // Additive Phase 4 schema change; down() removes the index and column for rollback.
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `comments` ADD COLUMN `moderationStatus` enum('visible', 'review', 'hidden') NOT NULL DEFAULT 'visible'",
    );
    await queryRunner.query(
      'CREATE INDEX `idx_comments_moderation_status` ON `comments` (`moderationStatus`)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `idx_comments_moderation_status` ON `comments`',
    );
    await queryRunner.query(
      'ALTER TABLE `comments` DROP COLUMN `moderationStatus`',
    );
  }
}
