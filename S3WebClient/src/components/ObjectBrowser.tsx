import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumbs,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import { objectRepository } from "../repositories";

interface Props {
  connection: S3Connection;
}

export default function ObjectBrowser({ connection }: Props) {
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [items, setItems] = useState<S3ObjectEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const client = useMemo(
    () =>
      new S3Client({
        endpoint: connection.endpoint,
        region: connection.region,
        forcePathStyle: connection.pathStyle === 1,
        credentials: {
          accessKeyId: connection.accessKeyId,
          secretAccessKey: connection.secretAccessKey,
        },
      }),
    [connection]
  );

  useEffect(() => {
    (async () => {
      const cached = await objectRepository.getChildren(
        connection.id,
        currentPrefix
      );
      setItems(cached);
    })();
  }, [connection.id, currentPrefix]);

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
      setCurrentPrefix("");
      const rootItems = await objectRepository.getChildren(connection.id, "");
      setItems(rootItems);
    } catch (err) {
      console.error("Error refreshing objects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (item: S3ObjectEntity) => {
    if (item.isFolder === 1) {
      setCurrentPrefix(item.key);
    }
  };

  const pathSegments = currentPrefix.split("/").filter(Boolean);
  const breadcrumbPaths = pathSegments.map(
    (_, idx) => pathSegments.slice(0, idx + 1).join("/") + "/"
  );

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Breadcrumbs sx={{ flexGrow: 1 }}>
          <Link sx={{ cursor: "pointer" }} onClick={() => setCurrentPrefix("")}>
            Root
          </Link>
          {pathSegments.map((seg, idx) => (
            <Link
              key={idx}
              sx={{ cursor: "pointer" }}
              onClick={() => setCurrentPrefix(breadcrumbPaths[idx])}
            >
              {seg}
            </Link>
          ))}
        </Breadcrumbs>
        <IconButton aria-label="refresh" onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>
      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : (
        <List>
          {items
            .sort((a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key))
            .map((item) => {
              const name = item.key
                .slice(currentPrefix.length)
                .replace(/\/$/, "");
              return (
                <ListItemButton
                  key={item.key}
                  onClick={() => handleFolderClick(item)}
                >
                  <ListItemIcon>
                    {item.isFolder ? <FolderIcon /> : <InsertDriveFileIcon />}
                  </ListItemIcon>
                  <ListItemText primary={name} />
                </ListItemButton>
              );
            })}
        </List>
      )}
    </div>
  );
}
