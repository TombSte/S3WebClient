import Dexie from "dexie";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
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
  }
}

export const dexieDb = new S3WebClientDatabase();
