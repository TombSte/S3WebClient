import { useState } from "react";
import { List, Collapse, ListItemText } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";

interface Props {
  rootItems: S3ObjectEntity[];
  loadChildren: (prefix: string) => Promise<S3ObjectEntity[]>;
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
  selected: string;
  onSelect: (prefix: string) => void;
}

interface NodeProps {
  item: S3ObjectEntity;
  depth: number;
  loadChildren: (prefix: string) => Promise<S3ObjectEntity[]>;
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
  selected: string;
  onSelect: (prefix: string) => void;
}

function Node({
  item,
  depth,
  loadChildren,
  onDownload,
  onRename,
  onProperties,
  selected,
  onSelect,
}: NodeProps) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<S3ObjectEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (item.isFolder !== 1) return;
    onSelect(item.key);
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
        onDownload={onDownload}
        onRename={onRename}
        onProperties={onProperties}
        selected={selected === item.key}
      />
      {item.isFolder === 1 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {loading ? (
              <ListItemText sx={{ pl: (depth + 1) * 2 + 2 }} primary="Caricamento..." />
            ) : (
              children
                .sort((a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key))
                .map((child) => (
                  <Node
                    key={child.key}
                    item={child}
                    depth={depth + 1}
                    loadChildren={loadChildren}
                    onDownload={onDownload}
                    onRename={onRename}
                    onProperties={onProperties}
                    selected={selected}
                    onSelect={onSelect}
                  />
                ))
            )}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default function ObjectTreeView({
  rootItems,
  loadChildren,
  onDownload,
  onRename,
  onProperties,
  selected,
  onSelect,
}: Props) {
  return (
    <List
      disablePadding
      sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
    >
      {rootItems
        .sort((a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key))
        .map((item) => (
          <Node
            key={item.key}
            item={item}
            depth={0}
            loadChildren={loadChildren}
            onDownload={onDownload}
            onRename={onRename}
            onProperties={onProperties}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </List>
  );
}
