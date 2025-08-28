import { useEffect, useState, useCallback, useRef } from "react";
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
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import { objectService } from "../repositories";
import { useNotifications } from "../contexts/NotificationsContext";
import NameConflictDialog from "./NameConflictDialog";
import { getAvailableName } from "../utils/naming";

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
  const [conflict, setConflict] = useState<{
    prefix: string;
    file: File;
    existing: Set<string>;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "error" | "success" | "warning" | "info" }>({ open: false, message: "", severity: "error" });
  const { addNotification } = useNotifications();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const loadFolders = useCallback(
    async (prefix: string) => {
      try {
        const all = await objectService.fetchChildren(connection, prefix);
        return all.filter((i) => i.isFolder === 1);
      } catch {
        setSnackbar({ open: true, message: "Error loading folders", severity: "error" });
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
        setFile(null);
      })();
    }
  }, [open, loadFolders]);

  const handleUpload = async () => {
    if (!file || selected === null) return;
    try {
      setUploading(true);
      setProgress(0);
      const existing = await objectService.fetchChildren(connection, selected);
      const names = new Set(
        existing
          .filter((i) => i.isFolder === 0)
          .map((i) => i.key.slice(selected.length))
      );
      if (names.has(file.name)) {
        setConflict({ prefix: selected, file, existing: names });
        setUploading(false);
        setProgress(null);
        return;
      }
      const key = `${selected}${file.name}`;
      // Presign PUT URL and upload via XHR to track progress
      const url = await objectService.presignUpload(
        connection,
        key,
        new Date(Date.now() + 5 * 60 * 1000),
        file.type || 'application/octet-stream'
      );
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", url);
        try {
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        } catch {}
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          else setProgress(null);
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));
        xhr.send(file);
      });
      await onUploaded();
      addNotification(`Uploaded ${file.name} to ${selected || '/'}`);
      onClose();
    } catch (err) {
      // Fallback: try SDK upload if presigned PUT fails (e.g., CORS or policy)
      try {
        if (!file) throw err;
        const key = `${selected}${file.name}`;
        await objectService.upload(connection, key, file);
        await onUploaded();
        addNotification(`Uploaded ${file.name} to ${selected || '/'}`);
        onClose();
      } catch {
        setSnackbar({ open: true, message: "Error during upload", severity: "error" });
      }
    } finally {
      setUploading(false);
      setProgress(null);
      xhrRef.current = null;
    }
  };

  const handleResolve = async (
    action: "replace" | "keep-both" | "cancel"
  ) => {
    if (!conflict) return;
    if (action === "cancel") {
      setConflict(null);
      return;
    }
    const name =
      action === "keep-both"
        ? getAvailableName(conflict.file.name, conflict.existing)
        : conflict.file.name;
    try {
      setUploading(true);
      setProgress(0);
      const key = `${conflict.prefix}${name}`;
      const url = await objectService.presignUpload(
        connection,
        key,
        new Date(Date.now() + 5 * 60 * 1000),
        conflict.file.type || 'application/octet-stream'
      );
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", url);
        try {
          xhr.setRequestHeader('Content-Type', conflict.file.type || 'application/octet-stream');
        } catch {}
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          else setProgress(null);
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));
        xhr.send(conflict.file);
      });
      await onUploaded();
      addNotification(`Uploaded ${name} to ${conflict.prefix || '/'}`);
      setConflict(null);
      onClose();
    } catch (err) {
      // Fallback to SDK upload
      try {
        const key = `${conflict.prefix}${name}`;
        await objectService.upload(connection, key, conflict.file);
        await onUploaded();
        addNotification(`Uploaded ${name} to ${conflict.prefix || '/'}`);
        setConflict(null);
        onClose();
      } catch {
        setSnackbar({ open: true, message: "Error during upload", severity: "error" });
      }
    } finally {
      setUploading(false);
      setProgress(null);
      xhrRef.current = null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Upload file</DialogTitle>
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
            sx={{ pl: 2, borderRadius: 0 }}
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
        {uploading && (
          <>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Uploading... {progress !== null ? `${progress}%` : ""}
            </Typography>
            <LinearProgress variant={progress !== null ? "determinate" : "indeterminate"} value={progress ?? undefined} sx={{ mt: 1 }} />
          </>
        )}
        {!uploading && (
          <Button
            variant="outlined"
            component="label"
            disabled={selected === null}
          >
            Choose file
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>
        )}
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          if (uploading && xhrRef.current) {
            try { xhrRef.current.abort(); } catch {}
            setUploading(false);
            setProgress(null);
            setConflict(null);
            setSnackbar({ open: true, message: "Upload canceled", severity: "info" });
          } else {
            onClose();
          }
        }}>Cancel</Button>
        {!uploading && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!file || selected === null}
          >
            Upload
          </Button>
        )}
      </DialogActions>
      </Dialog>
      <NameConflictDialog
        open={conflict !== null}
        name={conflict?.file.name ?? ""}
        onResolve={handleResolve}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
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
        sx={{ pl: depth * 2 + 2, borderRadius: 0 }}
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
