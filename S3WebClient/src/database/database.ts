import Dexie from "dexie";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import type { Environment } from "../types/env";
import type { UserProfile } from "../types/profile";

export interface Preferences {
  id?: number;
  theme: "light" | "dark";
  language: "it" | "en";
  uiPreferences: Record<string, unknown>;
  encryptionEnabled: boolean;
  encryptionPassphrase?: string;
}

export interface RecentLocation {
  id?: number;
  connectionId: string;
  prefix: string;
  timestamp: Date;
}

export interface ActivityLog {
  id?: number;
  type: "success" | "info" | "warning" | "error";
  message: string;
  timestamp: Date;
}

export interface ShareLink {
  id?: number;
  connectionId: string;
  key: string;
  url: string;
  expires: Date;
  createdAt: Date;
}

export class S3WebClientDatabase extends Dexie {
  connections!: Dexie.Table<S3Connection>;
  preferences!: Dexie.Table<Preferences>;
  recentLocations!: Dexie.Table<RecentLocation>;
  activities!: Dexie.Table<ActivityLog>;
  objects!: Dexie.Table<S3ObjectEntity>;
  shares!: Dexie.Table<ShareLink>;
  profiles!: Dexie.Table<UserProfile>;
  environments!: Dexie.Table<Environment>;

  constructor() {
    super("S3WebClientDatabase");

    this.version(1).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
    });

    this.version(2).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
    });

    this.version(3).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
      activities: "++id, type, message, timestamp",
    });

    this.version(4).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
      activities: "++id, type, message, timestamp",
      objects: "++id, connectionId, parent, key, isFolder",
    });

    this.version(5).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
      activities: "++id, type, message, timestamp",
      objects: "++id, connectionId, parent, key, isFolder",
      shares: "++id, connectionId, key, expires",
    });

    this.version(6).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
      activities: "++id, type, message, timestamp",
      objects: "++id, connectionId, parent, key, isFolder",
      shares: "++id, connectionId, key, expires",
      profiles: "++id, name, email",
    });

    // v7: Environments table with defaults and seeding
    this.version(7)
      .stores({
        connections:
          "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
        preferences: "++id, theme, language, encryptionEnabled",
        recentLocations: "++id, connectionId, prefix, timestamp",
        activities: "++id, type, message, timestamp",
        objects: "++id, connectionId, parent, key, isFolder",
        shares: "++id, connectionId, key, expires",
        profiles: "++id, name, email",
        environments: "++id, key, name, hidden, order, builtIn",
      })
      .upgrade(async (tx) => {
        const envs = tx.table<Environment>("environments");
        const existing = await envs.count();
        if (existing === 0) {
          // Seed default environments
          const defaults: Environment[] = [
            { key: "dev", name: "Development", color: "success", hidden: 0, order: 1, builtIn: 1 },
            { key: "test", name: "Testing", color: "warning", hidden: 0, order: 2, builtIn: 1 },
            { key: "preprod", name: "Pre Production", color: "info", hidden: 0, order: 3, builtIn: 1 },
            { key: "prod", name: "Production", color: "error", hidden: 0, order: 4, builtIn: 1 },
          ];
          await envs.bulkAdd(defaults);
        }
      });

    // v8: add colorHex to environments
    this.version(8)
      .stores({
        connections:
          "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
        preferences: "++id, theme, language, encryptionEnabled",
        recentLocations: "++id, connectionId, prefix, timestamp",
        activities: "++id, type, message, timestamp",
        objects: "++id, connectionId, parent, key, isFolder",
        shares: "++id, connectionId, key, expires",
        profiles: "++id, name, email",
        environments: "++id, key, name, hidden, order, builtIn, colorHex",
      })
      .upgrade(async () => {
        // no data migration needed; colorHex optional
      });

    // v9: deduplicate environments by key if any duplicates exist
    this.version(9)
      .stores({
        connections:
          "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
        preferences: "++id, theme, language, encryptionEnabled",
        recentLocations: "++id, connectionId, prefix, timestamp",
        activities: "++id, type, message, timestamp",
        objects: "++id, connectionId, parent, key, isFolder",
        shares: "++id, connectionId, key, expires",
        profiles: "++id, name, email",
        environments: "++id, key, name, hidden, order, builtIn, colorHex",
      })
      .upgrade(async (tx) => {
        const envs = tx.table<Environment>("environments");
        const all = await envs.toArray();
        const seen = new Set<string>();
        for (const e of all.sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0))) {
          if (!e.key) continue;
          const k = e.key;
          if (seen.has(k) && e.id != null) {
            await envs.delete(e.id);
          } else {
            seen.add(k);
          }
        }
      });

    // v10: enforce unique index on environment key to avoid future duplicates
    this.version(10)
      .stores({
        connections:
          "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
        preferences: "++id, theme, language, encryptionEnabled",
        recentLocations: "++id, connectionId, prefix, timestamp",
        activities: "++id, type, message, timestamp",
        objects: "++id, connectionId, parent, key, isFolder",
        shares: "++id, connectionId, key, expires",
        profiles: "++id, name, email",
        environments: "++id, &key, name, hidden, order, builtIn, colorHex",
      });
  }
}

export const dexieDb = new S3WebClientDatabase();
