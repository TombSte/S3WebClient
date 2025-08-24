import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import type { S3ObjectEntity } from "../types/s3";
import type { ShareLink } from "../database/database";
import { shareRepository } from "../repositories";

interface Props {
  connectionId: string;
  item: S3ObjectEntity | null;
  onClose: () => void;
}

export default function ObjectPropertiesDrawer({
  connectionId,
  item,
  onClose,
}: Props) {
  const [shares, setShares] = useState<ShareLink[]>([]);

  useEffect(() => {
    if (!item) {
      setShares([]);
      return;
    }
    (async () => {
      const links = await shareRepository.list(connectionId, item.key);
      setShares(links);
    })();
  }, [connectionId, item]);

  const removeShare = async (id: number) => {
    await shareRepository.remove(id);
    if (item) {
      const links = await shareRepository.list(connectionId, item.key);
      setShares(links);
    }
  };

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
            {shares.length > 0 && (
              <>
                <ListItem>
                  <ListItemText primary="Condivisioni" />
                </ListItem>
                {shares.map((s) => (
                  <ListItem
                    key={s.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeShare(s.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={s.url}
                      secondary={`Scade: ${new Date(s.expires).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </>
            )}
          </List>
        )}
      </Box>
    </Drawer>
  );
}

