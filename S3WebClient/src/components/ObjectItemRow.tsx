import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import type { S3ObjectEntity } from "../types/s3";
import type { ReactNode } from "react";

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

interface Props {
  item: S3ObjectEntity;
  name: string;
  depth?: number;
  onClick?: () => void;
  endIcon?: ReactNode;
}

export default function ObjectItemRow({
  item,
  name,
  depth = 0,
  onClick,
  endIcon,
}: Props) {
  return (
    <ListItemButton onClick={onClick} sx={{ pl: depth * 2 }}>
      <ListItemIcon>
        {item.isFolder ? (
          <FolderIcon sx={{ color: "primary.main" }} />
        ) : (
          getFileIcon(item.key)
        )}
      </ListItemIcon>
      <ListItemText primary={name} />
      {endIcon}
    </ListItemButton>
  );
}
