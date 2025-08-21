import { useState, useEffect, useCallback } from "react";
import { connectionRepository, activityRepository } from "../repositories";
import type {
  S3Connection,
  S3ConnectionForm,
  ConnectionTestResult,
} from "../types/s3";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

export const useS3Connections = () => {
  const [connections, setConnections] = useState<S3Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all connections
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const allConnections = await connectionRepository.getAll();
      setConnections(allConnections);
      setError(null);
    } catch (err) {
      setError("Errore nel caricamento delle connessioni");
      console.error("Error loading connections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new connection
  const addConnection = useCallback(
    async (connectionData: S3ConnectionForm): Promise<string> => {
      try {
        const id = await connectionRepository.add(connectionData);
        await activityRepository.add(
          "success",
          `Aggiunto bucket ${connectionData.displayName}`
        );
        await loadConnections();
        return id;
      } catch (err) {
        setError("Errore nell'aggiunta della connessione");
        console.error("Error adding connection:", err);
        throw err;
      }
    },
    [loadConnections]
  );

  // Update connection
  const updateConnection = useCallback(
    async (id: string, updates: Partial<S3Connection>): Promise<void> => {
      try {
        const existing = await connectionRepository.get(id);
        await connectionRepository.update(id, updates);
        const name = updates.displayName ?? existing?.displayName ?? id;
        await activityRepository.add("info", `Modificato bucket ${name}`);
        await loadConnections();
      } catch (err) {
        setError("Errore nell'aggiornamento della connessione");
        console.error("Error updating connection:", err);
        throw err;
      }
    },
    [loadConnections]
  );

  // Delete connection
  const deleteConnection = useCallback(
    async (id: string): Promise<void> => {
      try {
        const existing = await connectionRepository.get(id);
        await connectionRepository.delete(id);
        await activityRepository.add(
          "error",
          `Eliminato bucket ${existing?.displayName ?? id}`
        );
        await loadConnections();
      } catch (err) {
        setError("Errore nell'eliminazione della connessione");
        console.error("Error deleting connection:", err);
        throw err;
      }
    },
    [loadConnections]
  );

  // Toggle connection active status
  const toggleConnectionStatus = useCallback(
    async (id: string): Promise<void> => {
      try {
        const connection = connections.find((c) => c.id === id);
        if (connection) {
          await updateConnection(id, {
            isActive: connection.isActive === 1 ? 0 : 1,
          });
        }
      } catch (err) {
        setError("Errore nel cambio di stato della connessione");
        console.error("Error toggling connection status:", err);
        throw err;
      }
    },
    [connections, updateConnection]
  );

  // Duplicate connection
  const duplicateConnection = useCallback(
    async (id: string): Promise<string> => {
      try {
        const connection = connections.find((c) => c.id === id);
        if (!connection) {
          throw new Error("Connessione non trovata");
        }

        const duplicatedData: S3ConnectionForm = {
          displayName: `${connection.displayName} (Copia)`,
          environment: connection.environment,
          endpoint: connection.endpoint,
          region: connection.region,
          accessKeyId: connection.accessKeyId,
          secretAccessKey: connection.secretAccessKey,
          bucketName: connection.bucketName,
          pathStyle: connection.pathStyle,
          metadata: { ...connection.metadata },
        };

        return await addConnection(duplicatedData);
      } catch (err) {
        setError("Errore nella duplicazione della connessione");
        console.error("Error duplicating connection:", err);
        throw err;
      }
    },
    [connections, addConnection]
  );

  const performTest = useCallback(
    async (
      config: S3ConnectionForm | S3Connection
    ): Promise<ConnectionTestResult> => {
      try {
        const client = new S3Client({
          endpoint: config.endpoint,
          region: config.region || "us-east-1",
          forcePathStyle: config.pathStyle === 1,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        });

        try {
          await client.send(
            new HeadBucketCommand({ Bucket: config.bucketName })
          );
          return {
            success: true,
            message: "Connessione testata con successo",
            timestamp: new Date(),
          };
        } catch (err) {
          const e = err as {
            $metadata?: { httpStatusCode?: number };
            name?: string;
            message?: string;
          };
          let message = "Errore nel test della connessione";
          if (e.$metadata?.httpStatusCode === 404 || e.name === "NotFound") {
            message = "Bucket non trovato";
          }
          return {
            success: false,
            message,
            timestamp: new Date(),
            error: e.message ?? "Errore sconosciuto",
          };
        }
      } catch (err) {
        return {
          success: false,
          message: "Errore nel test della connessione",
          timestamp: new Date(),
          error: err instanceof Error ? err.message : "Errore sconosciuto",
        };
      }
    },
    []
  );

  // Test connection by id and store result
  const testConnection = useCallback(
    async (id: string): Promise<ConnectionTestResult> => {
      const connection = connections.find((c) => c.id === id);
      if (!connection) {
        const result: ConnectionTestResult = {
          success: false,
          message: "Errore nel test della connessione",
          timestamp: new Date(),
          error: "Connessione non trovata",
        };
        return result;
      }

      const result = await performTest(connection);
      await connectionRepository.test(id, result);
      await loadConnections();
      return result;
    },
    [connections, performTest, loadConnections]
  );

  // Test connection for arbitrary configuration (without saving)
  const testConnectionConfig = useCallback(
    async (config: S3ConnectionForm): Promise<ConnectionTestResult> => {
      return await performTest(config);
    },
    [performTest]
  );

  // Test connection using provided config and store result for an existing id
  const testConnectionWithConfig = useCallback(
    async (
      id: string,
      config: S3ConnectionForm
    ): Promise<ConnectionTestResult> => {
      const result = await performTest(config);
      await connectionRepository.test(id, result);
      await loadConnections();
      return result;
    },
    [performTest, loadConnections]
  );

  // Search connections
  const searchConnections = useCallback(
    async (query: string): Promise<S3Connection[]> => {
      try {
        if (!query.trim()) {
          return connections;
        }
        return await connectionRepository.search(query);
      } catch (err) {
        setError("Errore nella ricerca delle connessioni");
        console.error("Error searching connections:", err);
        return [];
      }
    },
    [connections]
  );

  // Get connections by environment
  const getConnectionsByEnvironment = useCallback(
    async (environment: string): Promise<S3Connection[]> => {
      try {
        return await connectionRepository.getByEnvironment(environment);
      } catch (err) {
        setError("Errore nel filtraggio per environment");
        console.error("Error filtering by environment:", err);
        return [];
      }
    },
    []
  );

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  return {
    connections,
    loading,
    error,
    addConnection,
    updateConnection,
    deleteConnection,
    toggleConnectionStatus,
    duplicateConnection,
    testConnection,
    testConnectionConfig,
    testConnectionWithConfig,
    searchConnections,
    getConnectionsByEnvironment,
    loadConnections,
    clearError: () => setError(null),
  };
};
