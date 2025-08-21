import { useState } from "react";
import { List, Collapse, ListItemText } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";

interface Props {
  rootItems: S3ObjectEntity[];
  loadChildren: (prefix: string) => Promise<S3ObjectEntity[]>;
}

interface NodeProps {
  item: S3ObjectEntity;
  depth: number;
  loadChildren: (prefix: string) => Promise<S3ObjectEntity[]>;
}

function Node({ item, depth, loadChildren }: NodeProps) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<S3ObjectEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (item.isFolder !== 1) return;
    if (!open && children.length === 0) {
      setLoading(true);
      const loaded = await loadChildren(item.key);
      setChildren(loaded);
      setLoading(false);
    }
    setOpen(!open);
  };

  const name = item.key.slice(item.parent.length).replace(/\/$/, "");

  return (
    <>
      <ObjectItemRow
        item={item}
        name={name}
        depth={depth}
        onClick={toggle}
        endIcon={item.isFolder === 1 ? open ? <ExpandLess /> : <ExpandMore /> : undefined}
      />
      {item.isFolder === 1 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {loading ? (
              <ListItemText sx={{ pl: (depth + 1) * 2 }} primary="Caricamento..." />
            ) : (
              children
                .sort((a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key))
                .map((child) => (
                  <Node
                    key={child.key}
                    item={child}
                    depth={depth + 1}
                    loadChildren={loadChildren}
                  />
                ))
            )}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default function ObjectTreeView({ rootItems, loadChildren }: Props) {
  return (
    <List disablePadding>
      {rootItems
        .sort((a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key))
        .map((item) => (
          <Node
            key={item.key}
            item={item}
            depth={0}
            loadChildren={loadChildren}
          />
        ))}
    </List>
  );
}
