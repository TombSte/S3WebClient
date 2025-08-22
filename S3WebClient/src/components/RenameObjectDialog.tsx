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
  currentName: string;
  onCancel: () => void;
  onConfirm: (newName: string) => void;
}

export default function RenameObjectDialog({
  open,
  currentName,
  onCancel,
  onConfirm,
}: Props) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Rinomina</DialogTitle>
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
        <Button onClick={() => onConfirm(name)} variant="contained">
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
}
