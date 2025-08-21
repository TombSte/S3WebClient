import { useState, useEffect, useCallback } from "react";
import { db } from "../database/database";
import type {
  S3Connection,
  S3ConnectionForm,
  ConnectionTestResult,
} from "../types/s3";

export const useS3Connections = () => {
  const [connections, setConnections] = useState<S3Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all connections
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const allConnections = await db.connections.toArray();
      setConnections(
        allConnections.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
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
        const newConnection = {
          ...connectionData,
          isActive: 1,
          testStatus: "untested" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const id = await db.connections.add(newConnection);
        await db.addActivity(
          "success",
          `Aggiunto bucket ${newConnection.displayName}`
        );
        await loadConnections();
        return id as string;
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
        const existing = await db.connections.get(id);
        await db.connections.update(id, {
          ...updates,
          updatedAt: new Date(),
        });
        const name = updates.displayName ?? existing?.displayName ?? id;
        await db.addActivity("info", `Modificato bucket ${name}`);
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
        const existing = await db.connections.get(id);
        await db.connections.delete(id);
        await db.addActivity(
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

  // Test connection
  const testConnection = useCallback(
    async (id: string): Promise<ConnectionTestResult> => {
      try {
        const connection = connections.find((c) => c.id === id);
        if (!connection) {
          throw new Error("Connessione non trovata");
        }

        // TODO: Implement actual S3 connection test
        // For now, simulate a test
        const testResult: ConnectionTestResult = {
          success: true,
          message: "Connessione testata con successo",
          timestamp: new Date(),
        };

        await db.testConnection(id, testResult);
        await loadConnections();

        return testResult;
      } catch (err) {
        const testResult: ConnectionTestResult = {
          success: false,
          message: "Errore nel test della connessione",
          timestamp: new Date(),
          error: err instanceof Error ? err.message : "Errore sconosciuto",
        };

        await db.testConnection(id, testResult);
        await loadConnections();

        return testResult;
      }
    },
    [connections, loadConnections]
  );

  // Search connections
  const searchConnections = useCallback(
    async (query: string): Promise<S3Connection[]> => {
      try {
        if (!query.trim()) {
          return connections;
        }
        return await db.searchConnections(query);
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
        return await db.getConnectionsByEnvironment(environment);
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
    searchConnections,
    getConnectionsByEnvironment,
    loadConnections,
    clearError: () => setError(null),
  };
};
