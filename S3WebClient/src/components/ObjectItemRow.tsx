import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
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
  onDuplicate?: (item: S3ObjectEntity) => void;
  onShare?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
  onDelete?: (item: S3ObjectEntity) => void;
  onMove?: (item: S3ObjectEntity) => void;
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
  onDuplicate,
  onShare,
  onProperties,
  onDelete,
  onMove,
  selected = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const hasActions =
    onDownload || onRename || onDuplicate || onShare || onProperties || onDelete || onMove;

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
        sx={{ pl: depth * 2 + 2, borderBottom: "1px solid", borderColor: "divider", borderRadius: 0 }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {item.isFolder ? (
            <FolderIcon sx={{ color: "primary.main" }} />
          ) : (
            getFileIcon(item.key)
          )}
        </ListItemIcon>
        <ListItemText primary={name} sx={{ flex: 1 }} />
        {!item.isFolder && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "text.secondary",
              mr: endIcon || hasActions ? 1 : 0,
            }}
          >
            {item.size !== undefined && (
              <Typography variant="body2">
                {(item.size / 1024).toFixed(1)} KB
              </Typography>
            )}
            {item.lastModified && (
              <Typography variant="body2">
                {item.lastModified.toLocaleDateString()}
              </Typography>
            )}
          </Box>
        )}
        {endIcon && <Box sx={{ mr: hasActions ? 1 : 0 }}>{endIcon}</Box>}
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
              Download
            </MenuItem>
          )}
          {item.isFolder === 0 && onDuplicate && (
            <MenuItem
              onClick={() => {
                onDuplicate(item);
                handleClose();
              }}
            >
              Duplicate
            </MenuItem>
          )}
          {item.isFolder === 0 && onRename && (
            <MenuItem
              onClick={() => {
                onRename(item);
                handleClose();
              }}
            >
              Rename
            </MenuItem>
          )}
          {item.isFolder === 0 && onShare && (
            <MenuItem
              onClick={() => {
                onShare(item);
                handleClose();
              }}
            >
              Share
            </MenuItem>
          )}
          {item.isFolder === 0 && onMove && (
            <MenuItem
              onClick={() => {
                onMove(item);
                handleClose();
              }}
            >
              Move
            </MenuItem>
          )}
          {item.isFolder === 0 && onDelete && (
            <MenuItem
              onClick={() => {
                onDelete(item);
                handleClose();
              }}
            >
              Delete
            </MenuItem>
          )}
          {onProperties && (
            <MenuItem
              onClick={() => {
                onProperties(item);
                handleClose();
              }}
            >
              Properties
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  );
}
