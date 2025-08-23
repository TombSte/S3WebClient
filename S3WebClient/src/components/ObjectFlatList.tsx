import { Box } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(Math.min(window.innerHeight, sorted.length * 48));

  useEffect(() => {
    const computeHeight = () => {
      const top = containerRef.current?.getBoundingClientRect().top || 0;
      const available = window.innerHeight - top - 16;
      setHeight(Math.min(available, sorted.length * 48));
    };
    computeHeight();
    window.addEventListener("resize", computeHeight);
    return () => window.removeEventListener("resize", computeHeight);
  }, [sorted.length]);

  return (
    <Box
      ref={containerRef}
      sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
    >
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
