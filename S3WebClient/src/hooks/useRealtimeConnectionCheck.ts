import { useEffect } from "react";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import {
  connectionRepository,
} from "../repositories";
import type {
  S3Connection,
  ConnectionTestResult,
} from "../types/s3";

async function performTest(connection: S3Connection): Promise<ConnectionTestResult> {
  try {
    const client = new S3Client({
      endpoint: connection.endpoint,
      region: connection.region || "us-east-1",
      forcePathStyle: connection.pathStyle === 1,
      credentials: {
        accessKeyId: connection.accessKeyId,
        secretAccessKey: connection.secretAccessKey,
      },
    });
    try {
      await client.send(new HeadBucketCommand({ Bucket: connection.bucketName }));
      return {
        success: true,
        message: "Connection tested successfully",
        timestamp: new Date(),
      };
    } catch (err: unknown) {
      const e = err as { $metadata?: { httpStatusCode?: number }; name?: string; message?: string };
      let message = "Error testing connection";
      if (e.$metadata?.httpStatusCode === 404 || e.name === "NotFound") {
        message = "Bucket not found";
      }
      return {
        success: false,
        message,
        timestamp: new Date(),
        error: e.message ?? "Unknown error",
      };
    }
  } catch (err) {
    return {
      success: false,
      message: "Error testing connection",
      timestamp: new Date(),
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export function useRealtimeConnectionCheck(
  enabled: boolean,
  intervalSeconds: number
) {
  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;

    const tick = async () => {
      // Avoid background activity and CORS noise when tab is hidden
      if (typeof document !== 'undefined' && document.hidden) return;
      const connections = await connectionRepository.getAll();
      for (const conn of connections) {
        // Skip inactive connections to reduce unnecessary traffic
        if ((conn.isActive ?? 1) !== 1) continue;
        const result = await performTest(conn);
        await connectionRepository.test(conn.id, result);
      }
    };

    const start = () => {
      // Run once immediately when visible
      void tick();
      timer = window.setInterval(tick, Math.max(1, intervalSeconds) * 1000);
    };
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };

    const onVisChange = () => {
      if (document.hidden) stop();
      else {
        stop();
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [enabled, intervalSeconds]);
}

export default useRealtimeConnectionCheck;
