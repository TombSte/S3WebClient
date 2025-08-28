import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { S3Connection, S3ObjectEntity } from "../types/s3";

function createClient(connection: S3Connection) {
  return new S3Client({
    endpoint: connection.endpoint,
    region: connection.region || "us-east-1",
    forcePathStyle: connection.pathStyle === 1,
    credentials: {
      accessKeyId: connection.accessKeyId,
      secretAccessKey: connection.secretAccessKey,
    },
  });
}

export class S3ObjectRepository {
  async list(connection: S3Connection, prefix: string): Promise<S3ObjectEntity[]> {
    const client = createClient(connection);
    const folders: S3ObjectEntity[] = [];
    const files: S3ObjectEntity[] = [];
    const seenPrefixes = new Set<string>();
    let token: string | undefined;
    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: connection.bucketName,
          Prefix: prefix,
          Delimiter: "/",
          ContinuationToken: token,
        })
      );
      (res.CommonPrefixes ?? []).forEach((p) => {
        if (!p.Prefix) return;
        if (seenPrefixes.has(p.Prefix)) return;
        seenPrefixes.add(p.Prefix);
        folders.push({
          connectionId: connection.id,
          key: p.Prefix,
          parent: prefix,
          isFolder: 1,
          size: 0,
        });
      });
      (res.Contents ?? []).forEach((o) => {
        if (!o.Key || o.Key === prefix) return;
        // skip folder marker objects (ending with '/') to avoid duplicates with CommonPrefixes
        if (o.Key.endsWith("/")) return;
        files.push({
          connectionId: connection.id,
          key: o.Key,
          parent: prefix,
          isFolder: 0,
          size: o.Size ?? 0,
          lastModified: o.LastModified,
        });
      });
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
    return [...folders, ...files];
  }

  async download(connection: S3Connection, key: string): Promise<Uint8Array | undefined> {
    const client = createClient(connection);
    const res = await client.send(
      new GetObjectCommand({ Bucket: connection.bucketName, Key: key })
    );
    return await res.Body?.transformToByteArray();
  }

  async listAll(connection: S3Connection): Promise<S3ObjectEntity[]> {
    const all: S3ObjectEntity[] = [];
    for await (const page of this.listAllPaginated(connection)) {
      all.push(...page);
    }
    return all;
  }

  async *listAllPaginated(
    connection: S3Connection
  ): AsyncGenerator<S3ObjectEntity[], void, void> {
    const client = createClient(connection);
    const seenFolders = new Set<string>();
    let token: string | undefined;
    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: connection.bucketName,
          ContinuationToken: token,
        })
      );
      const folders: S3ObjectEntity[] = [];
      const files: S3ObjectEntity[] = [];
      (res.Contents ?? []).forEach((o) => {
        if (!o.Key) return;
        const parts = o.Key.split("/");
        let prefix = "";
        for (let i = 0; i < parts.length - 1; i++) {
          const folderKey = `${prefix}${parts[i]}/`;
          if (!seenFolders.has(folderKey)) {
            seenFolders.add(folderKey);
            folders.push({
              connectionId: connection.id,
              key: folderKey,
              parent: prefix,
              isFolder: 1,
              size: 0,
            });
          }
          prefix = folderKey;
        }
        if (o.Key.endsWith("/")) return;
        files.push({
          connectionId: connection.id,
          key: o.Key,
          parent: prefix,
          isFolder: 0,
          size: o.Size ?? 0,
          lastModified: o.LastModified,
        });
      });
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
      yield [...folders, ...files];
    } while (token);
  }

  async rename(connection: S3Connection, oldKey: string, newKey: string): Promise<void> {
    const client = createClient(connection);
    await client.send(
      new CopyObjectCommand({
        Bucket: connection.bucketName,
        CopySource: `${connection.bucketName}/${encodeURIComponent(oldKey)}`,
        Key: newKey,
      })
    );
    await client.send(
      new DeleteObjectCommand({ Bucket: connection.bucketName, Key: oldKey })
    );
  }

  async delete(connection: S3Connection, key: string): Promise<void> {
    const client = createClient(connection);
    await client.send(
      new DeleteObjectCommand({ Bucket: connection.bucketName, Key: key })
    );
  }

  async move(connection: S3Connection, oldKey: string, newKey: string): Promise<void> {
    // Move is implemented as copy + delete (same as rename semantics)
    await this.rename(connection, oldKey, newKey);
  }

  async movePrefix(
    connection: S3Connection,
    oldPrefix: string,
    newPrefix: string
  ): Promise<void> {
    const client = createClient(connection);
    // List EVERY object under the prefix (no Delimiter)
    let token: string | undefined;
    const keys: string[] = [];
    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: connection.bucketName,
          Prefix: oldPrefix,
          ContinuationToken: token,
        })
      );
      (res.Contents ?? []).forEach((o) => {
        if (!o.Key) return;
        keys.push(o.Key);
      });
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);

    // Copy all to new prefix
    for (const key of keys) {
      const suffix = key.substring(oldPrefix.length);
      const targetKey = `${newPrefix}${suffix}`;
      await client.send(
        new CopyObjectCommand({
          Bucket: connection.bucketName,
          CopySource: `${connection.bucketName}/${encodeURIComponent(key)}`,
          Key: targetKey,
        })
      );
    }

    // Delete originals in batches (use DeleteObjects when possible)
    const chunkSize = 900; // Stay under service limits
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      if (chunk.length === 1) {
        await client.send(
          new DeleteObjectCommand({
            Bucket: connection.bucketName,
            Key: chunk[0],
          })
        );
      } else if (chunk.length > 1) {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: connection.bucketName,
            Delete: { Objects: chunk.map((k) => ({ Key: k })) },
          })
        );
      }
    }
  }

  async upload(connection: S3Connection, key: string, file: File): Promise<void> {
    const client = createClient(connection);
    const body = new Uint8Array(await file.arrayBuffer());
    await client.send(
      new PutObjectCommand({
        Bucket: connection.bucketName,
        Key: key,
        Body: body,
      })
    );
  }

  async createFolder(connection: S3Connection, key: string): Promise<void> {
    const client = createClient(connection);
    await client.send(
      new PutObjectCommand({
        Bucket: connection.bucketName,
        Key: key,
        Body: new Uint8Array(),
      })
    );
  }

  async duplicate(
    connection: S3Connection,
    sourceKey: string,
    targetKey: string
  ): Promise<void> {
    const client = createClient(connection);
    await client.send(
      new CopyObjectCommand({
        Bucket: connection.bucketName,
        CopySource: `${connection.bucketName}/${encodeURIComponent(sourceKey)}`,
        Key: targetKey,
      })
    );
  }

  async share(
    connection: S3Connection,
    key: string,
    expires: Date
  ): Promise<string> {
    const client = createClient(connection);
    const command = new GetObjectCommand({
      Bucket: connection.bucketName,
      Key: key,
    });
    const expiresIn = Math.max(
      1,
      Math.floor((expires.getTime() - Date.now()) / 1000)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await getSignedUrl(client as any, command as any, { expiresIn });
  }
}

export const s3ObjectRepository = new S3ObjectRepository();
