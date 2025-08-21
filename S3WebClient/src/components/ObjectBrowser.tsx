import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumbs,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
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
      if (cached.length > 0) {
        setItems(cached);
        return;
      }
      setLoading(true);
      try {
        const res = await client.send(
          new ListObjectsV2Command({
            Bucket: connection.bucketName,
            Prefix: currentPrefix,
            Delimiter: "/",
          })
        );
        const fetched: S3ObjectEntity[] = [];
        (res.CommonPrefixes ?? []).forEach((p) => {
          if (p.Prefix) {
            fetched.push({
              connectionId: connection.id,
              key: p.Prefix,
              parent: currentPrefix,
              isFolder: 1,
              size: 0,
            });
          }
        });
        (res.Contents ?? []).forEach((o) => {
          if (o.Key && o.Key !== currentPrefix) {
            fetched.push({
              connectionId: connection.id,
              key: o.Key,
              parent: currentPrefix,
              isFolder: 0,
              size: o.Size ?? 0,
              lastModified: o.LastModified,
            });
          }
        });
        await objectRepository.save(fetched);
        setItems(fetched);
      } catch (err) {
        console.error("Error loading objects", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [client, connection.id, connection.bucketName, currentPrefix]);

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
      <Breadcrumbs sx={{ mb: 2 }}>
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
