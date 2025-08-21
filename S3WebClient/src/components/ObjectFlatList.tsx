import { List } from "@mui/material";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";

interface Props {
  items: S3ObjectEntity[];
}

export default function ObjectFlatList({ items }: Props) {
  return (
    <List disablePadding>
      {items
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((item) => (
          <ObjectItemRow key={item.key} item={item} name={item.key} />
        ))}
    </List>
  );
}
