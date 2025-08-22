import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import type { S3ObjectEntity } from "../types/s3";

interface Props {
  item: S3ObjectEntity | null;
  onClose: () => void;
}

export default function ObjectPropertiesDialog({ item, onClose }: Props) {
  return (
    <Dialog open={!!item} onClose={onClose}>
      <DialogTitle>Proprietà</DialogTitle>
      <DialogContent>
        {item && (
          <List>
            <ListItem>
              <ListItemText
                primary="Nome"
                secondary={item.key.split("/").pop() || item.key}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Percorso" secondary={item.key} />
            </ListItem>
            {item.size !== undefined && (
              <ListItem>
                <ListItemText
                  primary="Dimensione"
                  secondary={`${item.size} B`}
                />
              </ListItem>
            )}
            {item.lastModified && (
              <ListItem>
                <ListItemText
                  primary="Ultima modifica"
                  secondary={item.lastModified.toString()}
                />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

