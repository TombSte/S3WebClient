import { List } from "@mui/material";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";

interface Props {
  items: S3ObjectEntity[];
  onDownload: (item: S3ObjectEntity) => void;
  onRename: (item: S3ObjectEntity) => void;
  onProperties: (item: S3ObjectEntity) => void;
}

export default function ObjectFlatList({
  items,
  onDownload,
  onRename,
  onProperties,
}: Props) {
  return (
    <List
      disablePadding
      sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
    >
      {items
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((item) => (
          <ObjectItemRow
            key={item.key}
            item={item}
            name={item.key}
            onDownload={onDownload}
            onRename={onRename}
            onProperties={onProperties}
          />
        ))}
    </List>
  );
}
