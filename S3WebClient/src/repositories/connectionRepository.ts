import type {
  S3Connection,
  S3ConnectionForm,
  ConnectionTestResult,
} from "../types/s3";
import type { S3WebClientDatabase } from "../database/database";

export interface ConnectionRepository {
  getAll(): Promise<S3Connection[]>;
  get(id: string): Promise<S3Connection | undefined>;
  add(data: S3ConnectionForm): Promise<string>;
  update(id: string, updates: Partial<S3Connection>): Promise<void>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<S3Connection[]>;
  getByEnvironment(environment: string): Promise<S3Connection[]>;
  test(id: string, result: ConnectionTestResult): Promise<void>;
}

export class DexieConnectionRepository implements ConnectionRepository {
  constructor(private db: S3WebClientDatabase) {}

  async getAll(): Promise<S3Connection[]> {
    const all = await this.db.connections.toArray();
    return all
      .map((c) => ({ ...c, id: String(c.id) }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  async get(id: string): Promise<S3Connection | undefined> {
    const numericId = Number(id);
    const connection = await this.db.connections.get(numericId);
    return connection ? { ...connection, id: String(connection.id) } : undefined;
  }

  async add(data: S3ConnectionForm): Promise<string> {
    const newConnection: S3Connection = {
      ...data,
      isActive: 1,
      testStatus: "untested",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const id = await this.db.connections.add(newConnection);
    return String(id);
  }

  async update(id: string, updates: Partial<S3Connection>): Promise<void> {
    await this.db.connections.update(Number(id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.connections.delete(Number(id));
  }

  async search(query: string): Promise<S3Connection[]> {
    const lowerQuery = query.toLowerCase();
    const all = await this.db.connections.toArray();
    return all
      .filter(
        (c) =>
          c.displayName.toLowerCase().includes(lowerQuery) ||
          c.bucketName.toLowerCase().includes(lowerQuery) ||
          c.endpoint.toLowerCase().includes(lowerQuery)
      )
      .map((c) => ({ ...c, id: String(c.id) }));
  }

  async getByEnvironment(environment: string): Promise<S3Connection[]> {
    const connections = await this.db.connections
      .where("environment")
      .equals(environment)
      .toArray();
    return connections
      .map((c) => ({ ...c, id: String(c.id) }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  async test(id: string, result: ConnectionTestResult): Promise<void> {
    await this.db.connections.update(Number(id), {
      testStatus: result.success ? "success" : "failed",
      lastTested: result.timestamp,
    });
  }
}
