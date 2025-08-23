import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";

interface Props {
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string) => void;
}

export default function CreateFolderDialog({ open, onCancel, onCreate }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Nuova cartella</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annulla</Button>
        <Button onClick={() => onCreate(name)} variant="contained" disabled={!name.trim()}>
          Crea
        </Button>
      </DialogActions>
    </Dialog>
  );
}
