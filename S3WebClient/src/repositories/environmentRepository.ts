import type { Environment, EnvColor } from "../types/env";
import type { S3WebClientDatabase } from "../database/database";

export interface EnvironmentRepository {
  getAll(options?: { includeHidden?: boolean }): Promise<Environment[]>;
  getVisible(): Promise<Environment[]>;
  getByKey(key: string): Promise<Environment | undefined>;
  add(env: Omit<Environment, "id" | "builtIn" | "order"> & { order?: number }): Promise<number>;
  updateById(id: number, updates: Partial<Environment>): Promise<void>;
  updateByKey(key: string, updates: Partial<Environment>): Promise<void>;
  hide(key: string): Promise<void>;
  unhide(key: string): Promise<void>;
  deleteById(id: number): Promise<void>;
  deleteByKey(key: string): Promise<void>;
}

export class DexieEnvironmentRepository implements EnvironmentRepository {
  private db: S3WebClientDatabase;

  constructor(db: S3WebClientDatabase) {
    this.db = db;
  }

  async getAll(options?: { includeHidden?: boolean }): Promise<Environment[]> {
    const includeHidden = options?.includeHidden ?? true;
    const all = await this.db.environments.toArray();
    const filtered = includeHidden ? all : all.filter((e) => e.hidden === 0);
    // Be defensive: handle possible undefined fields in older records
    return filtered.sort((a, b) => {
      const ao = typeof a.order === 'number' ? a.order : 0;
      const bo = typeof b.order === 'number' ? b.order : 0;
      if (ao !== bo) return ao - bo;
      const an = (a.name ?? '').toString();
      const bn = (b.name ?? '').toString();
      return an.localeCompare(bn);
    });
  }

  async getVisible(): Promise<Environment[]> {
    return this.getAll({ includeHidden: false });
  }

  async getByKey(key: string): Promise<Environment | undefined> {
    return await this.db.environments.where("key").equals(key).first();
  }

  async add(env: Omit<Environment, "id" | "builtIn" | "order"> & { order?: number }): Promise<number> {
    const existing = await this.getByKey(env.key);
    if (existing) {
      throw new Error(`Environment with key '${env.key}' already exists`);
    }

    const toAdd: Environment = {
      key: env.key,
      name: env.name,
      color: env.color,
      colorHex: env.colorHex,
      hidden: env.hidden ?? 0,
      order: env.order ?? Date.now(),
      builtIn: 0,
    };
    return await this.db.environments.add(toAdd);
  }

  async updateById(id: number, updates: Partial<Environment>): Promise<void> {
    await this.db.environments.update(id, updates);
  }

  async updateByKey(key: string, updates: Partial<Environment>): Promise<void> {
    const env = await this.getByKey(key);
    if (!env || env.id == null) return;
    await this.updateById(env.id, updates);
  }

  async hide(key: string): Promise<void> {
    await this.updateByKey(key, { hidden: 1 });
  }

  async unhide(key: string): Promise<void> {
    await this.updateByKey(key, { hidden: 0 });
  }

  async deleteById(id: number): Promise<void> {
    await this.db.environments.delete(id);
  }

  async deleteByKey(key: string): Promise<void> {
    const env = await this.getByKey(key);
    if (!env || env.id == null) return;
    await this.deleteById(env.id);
  }
}
