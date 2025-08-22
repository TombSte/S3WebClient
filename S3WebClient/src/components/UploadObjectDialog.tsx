import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import { s3ObjectRepository, objectRepository } from "../repositories";

interface Props {
  open: boolean;
  connection: S3Connection;
  onClose: () => void;
  onUploaded: () => Promise<void> | void;
}

export default function UploadObjectDialog({ open, connection, onClose, onUploaded }: Props) {
  const [rootFolders, setRootFolders] = useState<S3ObjectEntity[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const loadFolders = useCallback(
    async (prefix: string) => {
      const all = await s3ObjectRepository.list(connection, prefix);
      return all.filter((i) => i.isFolder === 1);
    },
    [connection]
  );

  useEffect(() => {
    if (open) {
      (async () => {
        const folders = await loadFolders("");
        setRootFolders(folders);
        setSelected(null);
        setFile(null);
      })();
    }
  }, [open, loadFolders]);

  const handleUpload = async () => {
    if (!file || selected === null) return;
    const key = `${selected}${file.name}`;
    try {
      await s3ObjectRepository.upload(connection, key, file);
      await objectRepository.save([
        {
          connectionId: connection.id,
          key,
          parent: selected,
          isFolder: 0,
          size: file.size,
          lastModified: new Date(),
        },
      ]);
      await onUploaded();
      onClose();
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Carica file</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Seleziona cartella di destinazione
        </Typography>
        <List
          disablePadding
          sx={{ maxHeight: 200, overflowY: "auto", mb: 2, bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
        >
          <ListItemButton
            selected={selected === ""}
            onClick={() => setSelected("")}
            sx={{ pl: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FolderIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="/" />
          </ListItemButton>
          {rootFolders.map((f) => (
            <FolderNode
              key={f.key}
              item={f}
              depth={1}
              selected={selected ?? ""}
              onSelect={setSelected}
              loadFolders={loadFolders}
            />
          ))}
        </List>
        <Button
          variant="outlined"
          component="label"
          disabled={selected === null}
        >
          Scegli file
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || selected === null}
        >
          Carica
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface FolderNodeProps {
  item: S3ObjectEntity;
  depth: number;
  selected: string;
  onSelect: (prefix: string) => void;
  loadFolders: (prefix: string) => Promise<S3ObjectEntity[]>;
}

function FolderNode({ item, depth, selected, onSelect, loadFolders }: FolderNodeProps) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<S3ObjectEntity[]>([]);

  const toggle = async () => {
    onSelect(item.key);
    if (!open && children.length === 0) {
      const loaded = await loadFolders(item.key);
      setChildren(loaded);
    }
    setOpen(!open);
  };

  const name = item.key.slice(item.parent.length).replace(/\/$/, "");

  return (
    <>
      <ListItemButton
        onClick={toggle}
        selected={selected === item.key}
        sx={{ pl: depth * 2 + 2 }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <FolderIcon sx={{ color: "primary.main" }} />
        </ListItemIcon>
        <ListItemText primary={name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children.map((child) => (
            <FolderNode
              key={child.key}
              item={child}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
              loadFolders={loadFolders}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}
