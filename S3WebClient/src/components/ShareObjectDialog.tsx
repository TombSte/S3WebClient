import { useState } from "react";
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
  url: string;
  onCancel: () => void;
  onGenerate: (expires: Date) => void;
}

export default function ShareObjectDialog({
  open,
  url,
  onCancel,
  onGenerate,
}: Props) {
  const now = new Date(Date.now() + 60 * 60 * 1000);
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [time, setTime] = useState(now.toISOString().slice(11, 16));

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Condividi</DialogTitle>
      <DialogContent>
        {url ? (
          <TextField
            fullWidth
            margin="dense"
            value={url}
            InputProps={{ readOnly: true }}
          />
        ) : (
          <>
            <TextField
              label="Data di scadenza"
              type="date"
              fullWidth
              margin="dense"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ora di scadenza"
              type="time"
              fullWidth
              margin="dense"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annulla</Button>
        {url ? (
          <Button onClick={onCancel} variant="contained">
            Chiudi
          </Button>
        ) : (
          <Button
            onClick={() => onGenerate(new Date(`${date}T${time}`))}
            variant="contained"
          >
            Genera
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
