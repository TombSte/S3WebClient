import type { S3ObjectEntity } from "../types/s3";
import type { S3WebClientDatabase } from "../database/database";

export interface ObjectRepository {
  getChildren(connectionId: string, parent: string): Promise<S3ObjectEntity[]>;
  save(objects: S3ObjectEntity[]): Promise<void>;
  replaceAll(
    connectionId: string,
    objects: S3ObjectEntity[]
  ): Promise<void>;
}

export class DexieObjectRepository implements ObjectRepository {
  constructor(private db: S3WebClientDatabase) {}

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
