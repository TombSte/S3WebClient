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

export class S3WebClientDatabase extends Dexie {
  connections!: Dexie.Table<S3Connection>;
  preferences!: Dexie.Table<Preferences>;
  recentLocations!: Dexie.Table<RecentLocation>;

  constructor() {
    super("S3WebClientDatabase");

    this.version(1).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
    });

    // Indexes for better performance
    this.version(2).stores({
      connections:
        "++id, displayName, environment, endpoint, bucketName, isActive, testStatus, createdAt, *metadata",
      preferences: "++id, theme, language, encryptionEnabled",
      recentLocations: "++id, connectionId, prefix, timestamp",
    });
  }

  // Helper methods for connections
  async getActiveConnections(): Promise<S3Connection[]> {
    const connections = await this.connections
      .where("isActive")
      .equals(1)
      .toArray();
    
    return connections.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getConnectionsByEnvironment(
    environment: string
  ): Promise<S3Connection[]> {
    const connections = await this.connections
      .where("environment")
      .equals(environment)
      .toArray();
    
    return connections.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async searchConnections(query: string): Promise<S3Connection[]> {
    const lowerQuery = query.toLowerCase();
    const allConnections = await this.connections.toArray();
    
    return allConnections.filter(
      (connection) =>
        connection.displayName.toLowerCase().includes(lowerQuery) ||
        connection.bucketName.toLowerCase().includes(lowerQuery) ||
        connection.endpoint.toLowerCase().includes(lowerQuery)
    );
  }

  async testConnection(
    connectionId: string,
    testResult: { success: boolean; message: string; error?: string }
  ): Promise<void> {
    await this.connections.update(connectionId, {
      testStatus: testResult.success ? "success" : "failed",
      lastTested: new Date(),
    });
  }

  // Helper methods for preferences
  async getPreferences(): Promise<Preferences | undefined> {
    return await this.preferences.get(1);
  }

  async savePreferences(preferences: Preferences): Promise<void> {
    await this.preferences.put({ ...preferences, id: 1 });
  }

  // Helper methods for recent locations
  async addRecentLocation(connectionId: string, prefix: string): Promise<void> {
    const existing = await this.recentLocations
      .where(["connectionId", "prefix"])
      .equals([connectionId, prefix])
      .first();

    if (existing) {
      // Update timestamp if exists
      await this.recentLocations.update(existing.id!, {
        timestamp: new Date(),
      });
    } else {
      // Add new recent location
      await this.recentLocations.add({
        connectionId,
        prefix,
        timestamp: new Date(),
      });
    }

    // Keep only last 50 recent locations
    const allLocations = await this.recentLocations
      .toArray();

    if (allLocations.length > 50) {
      const sortedLocations = allLocations.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const toDelete = sortedLocations.slice(50);
      await this.recentLocations.bulkDelete(toDelete.map((l) => l.id!));
    }
  }

  async getRecentLocations(connectionId: string): Promise<RecentLocation[]> {
    const locations = await this.recentLocations
      .where("connectionId")
      .equals(connectionId)
      .toArray();
    
    return locations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }
}

// Export singleton instance
export const db = new S3WebClientDatabase();
