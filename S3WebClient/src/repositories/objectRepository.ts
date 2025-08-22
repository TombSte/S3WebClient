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
    await this.db.objects.bulkPut(objects);
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
}
