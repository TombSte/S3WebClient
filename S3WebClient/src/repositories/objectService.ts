import type { S3Connection } from "../types/s3";
import type { S3ObjectEntity } from "../types/s3";
import { S3ObjectRepository } from "./s3ObjectRepository";
import { DexieObjectRepository } from "./objectRepository";

export class ObjectService {
  private remote: S3ObjectRepository;
  private local: DexieObjectRepository;

  constructor(remote: S3ObjectRepository, local: DexieObjectRepository) {
    this.remote = remote;
    this.local = local;
  }

  async fetchChildren(connection: S3Connection, prefix: string): Promise<S3ObjectEntity[]> {
    const all = await this.remote.list(connection, prefix);
    await this.local.save(all);
    return all;
  }

  async refreshAll(connection: S3Connection): Promise<S3ObjectEntity[]> {
    const all = await this.remote.listAll(connection);
    await this.local.replaceAll(connection.id, all);
    return all;
  }

  async download(connection: S3Connection, key: string): Promise<Uint8Array | undefined> {
    return await this.remote.download(connection, key);
  }

  async rename(connection: S3Connection, oldKey: string, newKey: string): Promise<void> {
    await this.remote.rename(connection, oldKey, newKey);
    // Refresh local cache after rename to keep paths in sync
    await this.refreshAll(connection);
  }

  async upload(connection: S3Connection, key: string, file: File): Promise<void> {
    await this.remote.upload(connection, key, file);
    const parent = key.slice(0, key.lastIndexOf("/") + 1);
    await this.local.save([
      {
        connectionId: connection.id,
        key,
        parent,
        isFolder: 0,
        size: file.size,
        lastModified: new Date(),
      },
    ]);
  }

  async createFolder(connection: S3Connection, key: string): Promise<void> {
    await this.remote.createFolder(connection, key);
    const parent = key.replace(/[^/]+\/$/, "");
    await this.local.save([
      {
        connectionId: connection.id,
        key,
        parent,
        isFolder: 1,
        size: 0,
      },
    ]);
  }
}
