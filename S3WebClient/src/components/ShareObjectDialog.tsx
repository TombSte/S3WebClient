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
      <DialogTitle>Share</DialogTitle>
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
              label="Expiration date"
              type="date"
              fullWidth
              margin="dense"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Expiration time"
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
        <Button onClick={onCancel}>Cancel</Button>
        {url ? (
          <Button onClick={onCancel} variant="contained">
            Close
          </Button>
        ) : (
          <Button
            onClick={() => onGenerate(new Date(`${date}T${time}`))}
            variant="contained"
          >
            Generate
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
