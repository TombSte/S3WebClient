import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import type { S3ObjectEntity } from "../types/s3";

interface Props {
  item: S3ObjectEntity | null;
  onClose: () => void;
}

export default function ObjectPropertiesDrawer({ item, onClose }: Props) {
  return (
    <Drawer anchor="right" open={!!item} onClose={onClose}>
      <Box sx={{ width: 320, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Proprietà
        </Typography>
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
                  secondary={`${(item.size / 1024).toFixed(1)} KB`}
                />
              </ListItem>
            )}
            {item.lastModified && (
              <ListItem>
                <ListItemText
                  primary="Ultima modifica"
                  secondary={item.lastModified.toLocaleString()}
                />
              </ListItem>
            )}
          </List>
        )}
      </Box>
    </Drawer>
  );
}

