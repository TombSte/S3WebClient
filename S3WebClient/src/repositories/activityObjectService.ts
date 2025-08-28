/* eslint-disable no-empty */
import type { S3Connection } from "../types/s3";
import type { ActivityRepository } from "./activityRepository";
import { ObjectService } from "./objectService";

export class ActivityObjectService {
  private inner: ObjectService;
  private activity: ActivityRepository;

  constructor(inner: ObjectService, activity: ActivityRepository) {
    this.inner = inner;
    this.activity = activity;
  }

  async fetchChildren(connection: S3Connection, prefix: string) {
    return await this.inner.fetchChildren(connection, prefix);
  }

  async refreshAll(connection: S3Connection) {
    // Do not track cache refresh
    return await this.inner.refreshAll(connection);
  }

  async download(connection: S3Connection, key: string) {
    try {
      const body = await this.inner.download(connection, key);
      if (body) {
        try {
          await this.activity.add(
            "success",
            `Downloaded ${key} from ${connection.displayName}`
          );
        } catch {}
      }
      return body;
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error downloading ${key} from ${connection.displayName}`
        );
      } catch {}
      throw e;
    }
  }

  async rename(connection: S3Connection, oldKey: string, newKey: string) {
    try {
      await this.inner.rename(connection, oldKey, newKey);
      try {
        await this.activity.add(
          "success",
          `Renamed ${oldKey} to ${newKey}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error renaming ${oldKey} to ${newKey}`
        );
      } catch {}
      throw e;
    }
  }

  async duplicate(
    connection: S3Connection,
    sourceKey: string,
    targetKey: string
  ) {
    try {
      await this.inner.duplicate(connection, sourceKey, targetKey);
      try {
        await this.activity.add(
          "success",
          `Duplicated ${sourceKey} to ${targetKey}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error duplicating ${sourceKey} to ${targetKey}`
        );
      } catch {}
      throw e;
    }
  }

  async share(connection: S3Connection, key: string, expires: Date) {
    try {
      const url = await this.inner.share(connection, key, expires);
      try {
        await this.activity.add("info", `Generated link for ${key}`);
      } catch {}
      return url;
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error generating link for ${key}`
        );
      } catch {}
      throw e;
    }
  }

  async presignUpload(
    connection: S3Connection,
    key: string,
    expires: Date,
    contentType?: string
  ) {
    try {
      const url = await this.inner.presignUpload(connection, key, expires, contentType);
      try {
        await this.activity.add("info", `Prepared upload for ${key}`);
      } catch {}
      return url;
    } catch (e) {
      try {
        await this.activity.add("error", `Error preparing upload for ${key}`);
      } catch {}
      throw e;
    }
  }

  async upload(connection: S3Connection, key: string, file: File) {
    try {
      await this.inner.upload(connection, key, file);
      try {
        await this.activity.add(
          "success",
          `Uploaded ${key} to ${connection.displayName}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error uploading ${key} to ${connection.displayName}`
        );
      } catch {}
      throw e;
    }
  }

  async createFolder(connection: S3Connection, key: string) {
    try {
      await this.inner.createFolder(connection, key);
      try {
        await this.activity.add(
          "success",
          `Created folder ${key} on ${connection.displayName}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error creating folder ${key} on ${connection.displayName}`
        );
      } catch {}
      throw e;
    }
  }

  async delete(connection: S3Connection, key: string) {
    try {
      await this.inner.delete(connection, key);
      try {
        await this.activity.add(
          "success",
          `Deleted ${key} from ${connection.displayName}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error deleting ${key} from ${connection.displayName}`
        );
      } catch {}
      throw e;
    }
  }

  async move(connection: S3Connection, oldKey: string, newKey: string) {
    try {
      await this.inner.move(connection, oldKey, newKey);
      try {
        await this.activity.add(
          "success",
          `Moved ${oldKey} to ${newKey}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Error moving ${oldKey} to ${newKey}`
        );
      } catch {}
      throw e;
    }
  }
}
