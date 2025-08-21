import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import { objectRepository } from "../repositories";
import ObjectTreeView from "./ObjectTreeView";
import ObjectFlatList from "./ObjectFlatList";
import SearchBar from "./SearchBar";

interface Props {
  connection: S3Connection;
}

export interface ObjectBrowserHandle {
  refresh: () => Promise<void>;
}

const ObjectBrowser = forwardRef<ObjectBrowserHandle, Props>(
  ({ connection }, ref) => {
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rootItems, setRootItems] = useState<S3ObjectEntity[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<S3ObjectEntity[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const client = useMemo(
    () =>
      new S3Client({
        endpoint: connection.endpoint,
        // Provide a default region for S3-compatible providers that may omit it
        region: connection.region || "us-east-1",
        forcePathStyle: connection.pathStyle === 1,
        credentials: {
          accessKeyId: connection.accessKeyId,
          secretAccessKey: connection.secretAccessKey,
        },
      }),
    [connection]
  );

  const fetchChildrenFromS3 = useCallback(
    async (prefix: string) => {
      const folders: S3ObjectEntity[] = [];
      const files: S3ObjectEntity[] = [];
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
      const all = [...folders, ...files];
      await objectRepository.save(all);
      return all;
    },
    [client, connection.bucketName, connection.id]
  );

  const loadChildren = useCallback(
    async (prefix: string) => {
      const cached = await objectRepository.getChildren(connection.id, prefix);
      if (cached.length > 0) return cached;
      return await fetchChildrenFromS3(prefix);
    },
    [connection.id, fetchChildrenFromS3]
  );

  useEffect(() => {
    (async () => {
      const children = await loadChildren("");
      setRootItems(children);
    })();
  }, [loadChildren, refreshTick]);

  useEffect(() => {
    (async () => {
      if (search.trim() === "") {
        setSearchResults([]);
        setSuggestions([]);
        return;
      }
      const results = await objectRepository.search(
        connection.id,
        search.trim()
      );
      setSearchResults(results);
      const names = results.map((r) => {
        const parts = r.key.split("/");
        return parts[parts.length - 1] || r.key;
      });
      setSuggestions(Array.from(new Set(names)).slice(0, 5));
    })();
  }, [search, connection.id, refreshTick]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const folders: S3ObjectEntity[] = [];
      const files: S3ObjectEntity[] = [];
      const seenFolders = new Set<string>();
      let token: string | undefined;
      do {
        const res = await client.send(
          new ListObjectsV2Command({
            Bucket: connection.bucketName,
            ContinuationToken: token,
          })
        );
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
      } while (token);
      await objectRepository.replaceAll(connection.id, [...folders, ...files]);
      setRefreshTick((t) => t + 1);
    } catch (err) {
      console.error("Error refreshing objects", err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ refresh: handleRefresh }));

  return (
    <div>
      <SearchBar
        value={search}
        onChange={setSearch}
        suggestions={suggestions}
        placeholder="Cerca..."
        sx={{ mb: 2 }}
      />
      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : search.trim() ? (
        searchResults.length > 0 ? (
          <ObjectFlatList items={searchResults} />
        ) : (
          <Typography>Nessun oggetto corrisponde alla ricerca</Typography>
        )
      ) : rootItems.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <InboxIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1 }} />
          <Typography>
            Questo bucket è vuoto. Carica qualche file per iniziare!
          </Typography>
        </Box>
      ) : (
        <ObjectTreeView
          key={refreshTick}
          rootItems={rootItems}
          loadChildren={loadChildren}
        />
      )}
    </div>
  );
});

export default ObjectBrowser;
