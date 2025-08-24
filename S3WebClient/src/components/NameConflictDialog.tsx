import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface Props {
  open: boolean;
  name: string;
  onResolve: (action: "replace" | "keep-both" | "cancel") => void;
}

export default function NameConflictDialog({ open, name, onResolve }: Props) {
  return (
    <Dialog open={open} onClose={() => onResolve("cancel")} fullWidth maxWidth="xs">
      <DialogTitle>File esistente</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Esiste già un file chiamato "{name}". Cosa vuoi fare?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onResolve("cancel")}>Annulla</Button>
        <Button onClick={() => onResolve("keep-both")}>Mantieni entrambi</Button>
        <Button onClick={() => onResolve("replace")} color="error" variant="contained">
          Sostituisci
        </Button>
      </DialogActions>
    </Dialog>
  );
}
