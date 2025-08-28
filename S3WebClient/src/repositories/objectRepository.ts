import type { S3ObjectEntity } from "../types/s3";
import type { S3WebClientDatabase } from "../database/database";

export interface ObjectRepository {
  getChildren(connectionId: string, parent: string): Promise<S3ObjectEntity[]>;
  search(connectionId: string, term: string): Promise<S3ObjectEntity[]>;
  save(objects: S3ObjectEntity[]): Promise<void>;
  replaceAll(
    connectionId: string,
    objects: S3ObjectEntity[]
  ): Promise<void>;
  clear(connectionId: string): Promise<void>;
}

export class DexieObjectRepository implements ObjectRepository {
  private db: S3WebClientDatabase;

  constructor(db: S3WebClientDatabase) {
    this.db = db;
  }

  async getChildren(
    connectionId: string,
    parent: string
  ): Promise<S3ObjectEntity[]> {
    return await this.db.objects
      .where("connectionId")
      .equals(connectionId)
      .and((obj) => obj.parent === parent)
      .toArray();
  }

  async search(
    connectionId: string,
    term: string
  ): Promise<S3ObjectEntity[]> {
    const q = term.toLowerCase();
    return await this.db.objects
      .where("connectionId")
      .equals(connectionId)
      .and(
        (obj) => obj.isFolder === 0 && obj.key.toLowerCase().includes(q)
      )
      .toArray();
  }

  async save(objects: S3ObjectEntity[]): Promise<void> {
    if (objects.length === 0) return;
    // Upsert by (connectionId, key) using compound unique index
    await this.db.transaction('rw', this.db.objects, async () => {
      const pairs = objects.map((o) => [o.connectionId, o.key] as [string, string]);
      // Delete any existing rows with same (connectionId, key) to avoid duplicates
      await this.db.objects
        .where('[connectionId+key]')
        .anyOf(pairs)
        .delete();
      await this.db.objects.bulkAdd(objects);
    });
  }

  async replaceAll(
    connectionId: string,
    objects: S3ObjectEntity[]
  ): Promise<void> {
    await this.db.objects
      .where("connectionId")
      .equals(connectionId)
      .delete();
    if (objects.length > 0) {
      await this.db.objects.bulkPut(objects);
    }
  }

  async clear(connectionId: string): Promise<void> {
    await this.db.objects.where("connectionId").equals(connectionId).delete();
  }
}
