import Dexie from "dexie";
import type { S3Connection } from "../types/s3";

export interface Preferences {
  id?: number;
  theme: "light" | "dark";
  language: "it" | "en";
  uiPreferences: Record<string, any>;
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

export class S3WebClientDatabase extends Dexie {
  connections!: Dexie.Table<S3Connection>;
  preferences!: Dexie.Table<Preferences>;
  recentLocations!: Dexie.Table<RecentLocation>;
  activities!: Dexie.Table<ActivityLog>;

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
  }
}

export const dexieDb = new S3WebClientDatabase();
