import type { S3WebClientDatabase } from "../database/database";

export class AdminRepository {
  private db: S3WebClientDatabase;

  constructor(db: S3WebClientDatabase) {
    this.db = db;
  }

  // Delete all connections and, if includeRelated, all related local cached data
  async clearConnections(includeRelated: boolean = true): Promise<void> {
    await this.db.transaction('rw', this.db.connections, this.db.objects, this.db.shares, this.db.recentLocations, async () => {
      if (includeRelated) {
        const all = await this.db.connections.toArray();
        const ids = all.map((c) => String(c.id));
        if (ids.length > 0) {
          await this.db.objects.where('connectionId').anyOf(ids).delete();
          await this.db.shares.where('connectionId').anyOf(ids).delete();
          await this.db.recentLocations.where('connectionId').anyOf(ids).delete();
        }
      }
      await this.db.connections.clear();
    });
  }

  async clearEnvironments(): Promise<void> {
    await this.db.environments.clear();
  }

  // Convenience combined clear
  async clearAll(includeEnvironments: boolean = false): Promise<void> {
    await this.clearConnections(true);
    if (includeEnvironments) {
      await this.clearEnvironments();
    }
  }
}

