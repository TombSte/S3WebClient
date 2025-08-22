import type { ActivityLog } from "../database/database";
import type { S3WebClientDatabase } from "../database/database";

export interface ActivityRepository {
  add(type: ActivityLog["type"], message: string): Promise<void>;
  getRecent(limit: number): Promise<ActivityLog[]>;
  getLast(): Promise<ActivityLog | null>;
}

export class DexieActivityRepository implements ActivityRepository {
  private db: S3WebClientDatabase;

  constructor(db: S3WebClientDatabase) {
    this.db = db;
  }

  async add(type: ActivityLog["type"], message: string): Promise<void> {
    await this.db.activities.add({ type, message, timestamp: new Date() });
    const total = await this.db.activities.count();
    if (total > 50) {
      const oldest = await this.db.activities
        .orderBy("timestamp")
        .limit(total - 50)
        .toArray();
      await this.db.activities.bulkDelete(oldest.map((a) => a.id!));
    }
  }

  async getRecent(limit: number): Promise<ActivityLog[]> {
    return await this.db.activities
      .orderBy("timestamp")
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getLast(): Promise<ActivityLog | null> {
    const last = await this.db.activities.orderBy("timestamp").last();
    return last ?? null;
  }
}
