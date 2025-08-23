import { useState } from "react";
import { Box, Collapse, ListItemText } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { S3ObjectEntity } from "../types/s3";
import ObjectItemRow from "./ObjectItemRow";
import { FixedSizeList as VirtualList } from "react-window";
import type { ListChildComponentProps } from "react-window";

interface Props {
  rootItems: S3ObjectEntity[];
  loadChildren: (prefix: string) => Promise<S3ObjectEntity[]>;
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onDuplicate?: (item: S3ObjectEntity) => void;
  onShare?: (item: S3ObjectEntity) => void;
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
  onDuplicate?: (item: S3ObjectEntity) => void;
  onShare?: (item: S3ObjectEntity) => void;
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
  onDuplicate,
  onShare,
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
  const sortedChildren = [...children].sort(
    (a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key)
  );

  return (
    <>
      <ObjectItemRow
        item={item}
        name={name}
        depth={depth}
        onClick={toggle}
        endIcon={item.isFolder === 1 ? open ? <ExpandLess /> : <ExpandMore /> : undefined}
        onDownload={onDownload}
        onRename={item.isFolder ? undefined : onRename}
        onDuplicate={item.isFolder ? undefined : onDuplicate}
        onShare={item.isFolder ? undefined : onShare}
        onProperties={onProperties}
        selected={selected === item.key}
      />
      {item.isFolder === 1 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {loading ? (
            <ListItemText
              sx={{ pl: (depth + 1) * 2 + 2 }}
              primary="Caricamento..."
            />
          ) : (
            <VirtualList
              height={Math.min(400, sortedChildren.length * 48)}
              itemCount={sortedChildren.length}
              itemSize={48}
              width="100%"
            >
              {({ index, style }: ListChildComponentProps) => {
                const child = sortedChildren[index];
                return (
                  <div style={style}>
                    <Node
                      key={child.key}
                      item={child}
                      depth={depth + 1}
                      loadChildren={loadChildren}
                      onDownload={onDownload}
                      onRename={onRename}
                      onDuplicate={onDuplicate}
                      onShare={onShare}
                      onProperties={onProperties}
                      selected={selected}
                      onSelect={onSelect}
                    />
                  </div>
                );
              }}
            </VirtualList>
          )}
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
  onDuplicate,
  onShare,
  onProperties,
  selected,
  onSelect,
}: Props) {
  const sorted = [...rootItems].sort(
    (a, b) => b.isFolder - a.isFolder || a.key.localeCompare(b.key)
  );
  const height = Math.min(600, sorted.length * 48);
  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
      <VirtualList
        height={height}
        itemCount={sorted.length}
        itemSize={48}
        width="100%"
      >
        {({ index, style }: ListChildComponentProps) => {
          const item = sorted[index];
          return (
            <div style={style}>
              <Node
                item={item}
                depth={0}
                loadChildren={loadChildren}
                onDownload={onDownload}
                onRename={onRename}
                onDuplicate={onDuplicate}
                onShare={onShare}
                onProperties={onProperties}
                selected={selected}
                onSelect={onSelect}
              />
            </div>
          );
        }}
      </VirtualList>
    </Box>
  );
}
