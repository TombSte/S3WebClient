import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import type { S3ObjectEntity } from "../types/s3";
import { useState } from "react";
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
  onDownload?: (item: S3ObjectEntity) => void;
  onRename?: (item: S3ObjectEntity) => void;
  onProperties?: (item: S3ObjectEntity) => void;
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
}: Props) {
  const [menuPos, setMenuPos] = useState<
    | {
        mouseX: number;
        mouseY: number;
      }
    | null
  >(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPos(
      menuPos === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null
    );
  };

  const handleClose = () => {
    setMenuPos(null);
  };

  return (
    <>
      <ListItemButton
        onClick={onClick}
        onContextMenu={handleContextMenu}
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
      </ListItemButton>
      <Menu
        open={menuPos !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          menuPos !== null
            ? { top: menuPos.mouseY, left: menuPos.mouseX }
            : undefined
        }
      >
        {item.isFolder === 0 && (
          <MenuItem
            onClick={() => {
              onDownload?.(item);
              handleClose();
            }}
          >
            Scarica
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onRename?.(item);
            handleClose();
          }}
        >
          Rinomina
        </MenuItem>
        <MenuItem
          onClick={() => {
            onProperties?.(item);
            handleClose();
          }}
        >
          Proprietà
        </MenuItem>
      </Menu>
    </>
  );
}
