import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import type { S3ObjectEntity } from "../types/s3";
import { useState } from "react";
import type { ReactNode } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
  selected?: boolean;
}

export default function ObjectItemRow({
  item,
  name,
  depth = 0,
  onClick,
  endIcon,
  onDownload,
  onRename,
  onProperties,
  selected = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const hasActions = onDownload || onRename || onProperties;

  const handleMenuOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ListItemButton
        onClick={onClick}
        selected={selected}
        sx={{ pl: depth * 2 }}
      >
        <ListItemIcon>
          {item.isFolder ? (
            <FolderIcon sx={{ color: "primary.main" }} />
          ) : (
            getFileIcon(item.key)
          )}
        </ListItemIcon>
        <ListItemText primary={name} />
        {endIcon}
        {hasActions && (
          <IconButton
            edge="end"
            size="small"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </ListItemButton>
      {hasActions && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
        >
          {item.isFolder === 0 && onDownload && (
            <MenuItem
              onClick={() => {
                onDownload(item);
                handleClose();
              }}
            >
              Scarica
            </MenuItem>
          )}
          {onRename && (
            <MenuItem
              onClick={() => {
                onRename(item);
                handleClose();
              }}
            >
              Rinomina
            </MenuItem>
          )}
          {onProperties && (
            <MenuItem
              onClick={() => {
                onProperties(item);
                handleClose();
              }}
            >
              Proprietà
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  );
}
