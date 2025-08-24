import { Box } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import { useMemo } from "react";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";

interface Props {
  items: S3ObjectEntity[];
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onDuplicate?: (item: S3ObjectEntity) => void;
  onShare?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
  onDelete?: (item: S3ObjectEntity) => void;
  onMove?: (item: S3ObjectEntity) => void;
}

export default function ObjectFlatList({
  items,
  onDownload,
  onRename,
  onDuplicate,
  onShare,
  onProperties,
  onDelete,
  onMove,
}: Props) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.key.localeCompare(b.key)),
    [items]
  );

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 1,
        width: "100%",
      }}
    >
      <Virtuoso
        useWindowScroll
        data={sorted}
        itemContent={(_index: number, item: S3ObjectEntity) => (
          <ObjectItemRow
            item={item}
            name={item.key}
            onDownload={onDownload}
            onRename={item.isFolder ? undefined : onRename}
            onDuplicate={item.isFolder ? undefined : onDuplicate}
            onShare={item.isFolder ? undefined : onShare}
            onProperties={onProperties}
            onDelete={item.isFolder ? undefined : onDelete}
            onMove={onMove}
          />
        )}
      />
    </Box>
  );
}
