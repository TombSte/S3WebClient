import { Box } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";

interface Props {
  items: S3ObjectEntity[];
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onDuplicate?: (item: S3ObjectEntity) => void;
  onShare?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
}

export default function ObjectFlatList({
  items,
  onDownload,
  onRename,
  onDuplicate,
  onShare,
  onProperties,
}: Props) {
  const sorted = [...items].sort((a, b) => a.key.localeCompare(b.key));
  const height = Math.min(600, sorted.length * 48);
  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
      <Virtuoso
        style={{ height, width: "100%" }}
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
          />
        )}
      />
    </Box>
  );
}
