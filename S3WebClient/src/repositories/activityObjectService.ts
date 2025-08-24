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
    // Non tracciamo l'aggiornamento della cache
    return await this.inner.refreshAll(connection);
  }

  async download(connection: S3Connection, key: string) {
    try {
      const body = await this.inner.download(connection, key);
      if (body) {
        try {
          await this.activity.add(
            "success",
            `Scaricato ${key} da ${connection.displayName}`
          );
        } catch {}
      }
      return body;
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore download ${key} da ${connection.displayName}`
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
          `Rinominato ${oldKey} in ${newKey}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore rinomina ${oldKey} in ${newKey}`
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
          `Duplicato ${sourceKey} in ${targetKey}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore duplicazione ${sourceKey} in ${targetKey}`
        );
      } catch {}
      throw e;
    }
  }

  async share(connection: S3Connection, key: string, expires: Date) {
    try {
      const url = await this.inner.share(connection, key, expires);
      try {
        await this.activity.add("info", `Generato link per ${key}`);
      } catch {}
      return url;
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore generazione link per ${key}`
        );
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
          `Caricato ${key} su ${connection.displayName}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore upload ${key} su ${connection.displayName}`
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
          `Creata cartella ${key} su ${connection.displayName}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore creazione cartella ${key} su ${connection.displayName}`
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
          `Eliminato ${key} da ${connection.displayName}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore eliminazione ${key} da ${connection.displayName}`
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
          `Spostato ${oldKey} in ${newKey}`
        );
      } catch {}
    } catch (e) {
      try {
        await this.activity.add(
          "error",
          `Errore spostamento ${oldKey} in ${newKey}`
        );
      } catch {}
      throw e;
    }
  }
}
