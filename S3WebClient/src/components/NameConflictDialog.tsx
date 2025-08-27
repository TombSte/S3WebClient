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
      <DialogTitle>File exists</DialogTitle>
      <DialogContent dividers>
        <Typography>
          A file named "{name}" already exists. What do you want to do?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onResolve("cancel")}>Cancel</Button>
        <Button onClick={() => onResolve("keep-both")}>Keep both</Button>
        <Button onClick={() => onResolve("replace")} color="error" variant="contained">
          Replace
        </Button>
      </DialogActions>
    </Dialog>
  );
}
