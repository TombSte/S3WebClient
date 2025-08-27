import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}

export default function CreateFolderDialog({
  open,
  connection,
  onClose,
  onCreated,
}: Props) {
  const [rootFolders, setRootFolders] = useState<S3ObjectEntity[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");

  const loadFolders = useCallback(
    async (prefix: string) => {
      try {
        const all = await objectService.fetchChildren(connection, prefix);
        return all.filter((i) => i.isFolder === 1);
      } catch {
        alert("Error loading folders");
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
        setSelected(null);
        setName("");
      })();
    }
  }, [open, loadFolders]);

  const handleCreate = async () => {
    if (selected === null || !name.trim()) return;
    const key = `${selected}${name.replace(/\/+$/, "")}/`;
    try {
      await objectService.createFolder(connection, key);
      await onCreated();
      onClose();
    } catch {
      alert("Error creating folder");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New folder</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select destination folder
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
        <TextField
          label="Folder name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={selected === null}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={selected === null || !name.trim()}
        >
          Create
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
