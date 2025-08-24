import type { ShareLink, S3WebClientDatabase } from "../database/database";

export interface ShareRepository {
  add(data: {
    connectionId: string;
    key: string;
    url: string;
    expires: Date;
  }): Promise<void>;
  list(connectionId: string, key: string): Promise<ShareLink[]>;
  remove(id: number): Promise<void>;
}

export class DexieShareRepository implements ShareRepository {
  private db: S3WebClientDatabase;

  constructor(db: S3WebClientDatabase) {
    this.db = db;
  }

  async add({ connectionId, key, url, expires }: {
    connectionId: string;
    key: string;
    url: string;
    expires: Date;
  }): Promise<void> {
    await this.db.shares.add({
      connectionId,
      key,
      url,
      expires,
      createdAt: new Date(),
    });
  }

  async list(connectionId: string, key: string): Promise<ShareLink[]> {
    return await this.db.shares
      .where({ connectionId, key })
      .toArray();
  }

  async remove(id: number): Promise<void> {
    await this.db.shares.delete(id);
  }
}
