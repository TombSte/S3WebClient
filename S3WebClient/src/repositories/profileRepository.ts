import type { UserProfile } from "../types/profile";
import type { S3WebClientDatabase } from "../database/database";

export interface ProfileRepository {
  get(): Promise<UserProfile | undefined>;
  save(profile: UserProfile): Promise<void>;
}

export class DexieProfileRepository implements ProfileRepository {
  private db: S3WebClientDatabase;

  constructor(db: S3WebClientDatabase) {
    this.db = db;
  }

  async get(): Promise<UserProfile | undefined> {
    return this.db.profiles.get(1);
  }

  async save(profile: UserProfile): Promise<void> {
    await this.db.profiles.put({ ...profile, id: 1 });
  }
}
