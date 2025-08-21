import { useCallback, useEffect, useMemo, useState } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Collapse,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import { objectRepository } from "../repositories";

interface Props {
  connection: S3Connection;
}

export default function ObjectBrowser({ connection }: Props) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rootItems, setRootItems] = useState<S3ObjectEntity[]>([]);
  const [search, setSearch] = useState("");

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

  interface NodeProps {
    item: S3ObjectEntity;
    depth: number;
  }

  const getFileIcon = (key: string) => {
    const ext = key.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <PictureAsPdfIcon sx={{ color: "error.main" }} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "bmp":
      case "svg":
      case "webp":
        return <ImageIcon sx={{ color: "success.main" }} />;
      default:
        return <InsertDriveFileIcon sx={{ color: "text.secondary" }} />;
    }
  };

  const Node = ({ item, depth }: NodeProps) => {
    const [open, setOpen] = useState(false);
    const [children, setChildren] = useState<S3ObjectEntity[]>([]);
    const [childLoading, setChildLoading] = useState(false);

    const toggle = async () => {
      if (item.isFolder !== 1) return;
      if (!open && children.length === 0) {
        setChildLoading(true);
        const loaded = await loadChildren(item.key);
        setChildren(loaded);
        setChildLoading(false);
      }
      setOpen(!open);
    };

    const name = item.key.slice(item.parent.length).replace(/\/$/, "");

    return (
      <>
        <ListItemButton onClick={toggle} sx={{ pl: depth * 2 }}>
          <ListItemIcon>
            {item.isFolder ? (
              <FolderIcon sx={{ color: "warning.main" }} />
            ) : (
              getFileIcon(item.key)
            )}
          </ListItemIcon>
          <ListItemText primary={name} />
          {item.isFolder === 1 && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        {item.isFolder === 1 && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {childLoading ? (
                <ListItemText
                  sx={{ pl: (depth + 1) * 2 }}
                  primary="Caricamento..."
                />
              ) : (
                children
                  .sort(
                    (a, b) =>
                      b.isFolder - a.isFolder || a.key.localeCompare(b.key)
                  )
                  .map((child) => (
                    <Node key={child.key} item={child} depth={depth + 1} />
                  ))
              )}
            </List>
          </Collapse>
        )}
      </>
    );
  };

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography sx={{ flexGrow: 1 }}>Oggetti</Typography>
        <TextField
          placeholder="Cerca..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mr: 1, width: 200 }}
        />
        <IconButton aria-label="refresh" onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>
      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : (
        <List key={refreshTick} disablePadding>
          {rootItems
            .sort((a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key))
            .map((item) => (
              <Node key={item.key} item={item} depth={0} />
            ))}
        </List>
      )}
    </div>
  );
}
