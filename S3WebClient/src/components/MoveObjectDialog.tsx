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
import { objectService } from "../repositories";

interface Props {
  open: boolean;
  connection: S3Connection;
  sourceKey: string;
  onClose: () => void;
  onMoved: () => Promise<void> | void;
}

export default function MoveObjectDialog({ open, connection, sourceKey, onClose, onMoved }: Props) {
  const [rootFolders, setRootFolders] = useState<S3ObjectEntity[]>([]);
  const [selected, setSelected] = useState<string | null>("");

  const loadFolders = useCallback(
    async (prefix: string) => {
      try {
        const all = await objectService.fetchChildren(connection, prefix);
        return all.filter((i) => i.isFolder === 1);
      } catch {
        alert("Errore nel caricamento delle cartelle");
        return [];
      }
    },
    [connection]
  );

  useEffect(() => {
    if (open) {
      (async () => {
        const folders = await loadFolders("");
        setRootFolders(folders);
        setSelected("");
      })();
    }
  }, [open, loadFolders]);

  const handleMove = async () => {
    if (selected === null) return;
    const isFolder = sourceKey.endsWith("/");
    const base = isFolder
      ? sourceKey.replace(/\/$/, "").split("/").pop() || ""
      : sourceKey.split("/").pop() || sourceKey;
    const newKey = isFolder ? `${selected}${base}/` : `${selected}${base}`;
    if (newKey === sourceKey) {
      onClose();
      return;
    }
    // Prevent moving a folder inside itself
    if (isFolder && newKey.startsWith(sourceKey)) {
      alert("Non puoi spostare una cartella dentro se stessa");
      return;
    }
    // Prevent moving folder into destination where same-named folder exists
    if (isFolder) {
      try {
        const destChildren = await objectService.fetchChildren(connection, selected);
        const exists = destChildren.some(
          (c) => c.isFolder === 1 && c.key === `${selected}${base}/`
        );
        if (exists) {
          alert("Nella destinazione esiste già una cartella con lo stesso nome");
          return;
        }
      } catch {
        // ignore check errors, proceed to move and rely on backend
      }
    }
    try {
      await objectService.move(connection, sourceKey, newKey);
      await onMoved();
      onClose();
    } catch {
      alert("Errore durante lo spostamento");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Sposta oggetto</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Seleziona cartella di destinazione
        </Typography>
        <List
          disablePadding
          sx={{ maxHeight: 240, overflowY: "auto", mb: 2, bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
        >
          <ListItemButton selected={selected === ""} onClick={() => setSelected("")} sx={{ pl: 2 }}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleMove} variant="contained" disabled={selected === null}>
          Sposta qui
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
      <ListItemButton onClick={toggle} selected={selected === item.key} sx={{ pl: depth * 2 + 2 }}>
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
