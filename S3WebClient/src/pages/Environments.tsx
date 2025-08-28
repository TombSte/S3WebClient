import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  Chip,
  TextField,
  Button,
  Alert,
  Popover,
} from "@mui/material";
import { Tune, Add, Edit, Delete, Save, Close } from "@mui/icons-material";
import { useEnvironments } from "../contexts/EnvironmentsContext";
// no explicit EnvColor usage in this page
import { slugify } from "../utils/slug";
import ConfirmDialog from "../components/ConfirmDialog";

export default function EnvironmentsPage() {
  const { allEnvironments, setHidden, add } = useEnvironments();
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState<string>("#2e7d32");
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingColorHex, setEditingColorHex] = useState<string>("#2e7d32");
  const [addPickerAnchor, setAddPickerAnchor] = useState<HTMLElement | null>(null);
  const [editPickerAnchor, setEditPickerAnchor] = useState<HTMLElement | null>(null);

  const key = useMemo(() => slugify(name), [name]);

  const handleAdd = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!key.trim()) {
      setError("Invalid key generated from name");
      return;
    }
    try {
      await add({ key, name, colorHex });
      setName("");
      setColorHex("#2e7d32");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add environment");
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: "100%", display: "flex", flexDirection: "column", flex: 1, textAlign: "left", alignItems: "flex-start" }}>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Tune sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
              Environments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage visibility and create custom environments
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Toggle visibility to include/exclude environments in filters and forms. Add new environments below.
            </Typography>

            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            {/* Existing environments */}
            <List sx={{ p: 0 }}>
              {allEnvironments.map((env, idx) => (
                <Box key={env.key}>
                  <ListItem sx={{ px: 0, py: 1 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {env.builtIn === 0 && editingKey !== env.key && (
                          <>
                            <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => { setEditingKey(env.key); setEditingName(env.name); setEditingColorHex(env.colorHex || '#2e7d32'); }}>Edit</Button>
                            <Button size="small" color="error" variant="outlined" startIcon={<Delete />} onClick={() => setConfirmDelete(env.key)}>Delete</Button>
                          </>
                        )}
                        <Switch
                          checked={env.hidden === 0}
                          onChange={(e) => setHidden(env.key, !e.target.checked)}
                          color="primary"
                        />
                      </Box>
                    }
                  >
                    {editingKey === env.key ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                        <TextField size="small" label="Name" value={editingName} onChange={(e) => setEditingName(e.target.value)} sx={{ maxWidth: 320 }} />
                        <Box sx={{ position: 'relative', width: 160 }}>
                          <Box
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 1,
                              p: '6px 10px', border: '1px solid', borderColor: 'divider', borderRadius: 1,
                              cursor: 'pointer', transition: 'all 0.15s ease',
                              '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                              bgcolor: 'background.paper',
                            }}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => setEditPickerAnchor(e.currentTarget)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditPickerAnchor(e.currentTarget as HTMLElement); } }}
                          >
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: editingColorHex, border: '1px solid', borderColor: 'divider' }} />
                            <Typography variant="body2" color="text.secondary">Change Color</Typography>
                          </Box>
                          {/* Color popover anchored via editPickerAnchor */}
                        </Box>
                        <Chip label={env.key} size="small" variant="outlined" />
                        <Button size="small" startIcon={<Save />} variant="contained" onClick={async () => {
                          const trimmed = editingName.trim();
                          if (!trimmed) return;
                          try {
                            // only update display name
                            const { environmentRepository } = await import("../repositories");
                            await environmentRepository.updateByKey(env.key, { name: trimmed, colorHex: editingColorHex });
                            setEditingKey(null);
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Unable to update environment");
                          }
                        }}>Save</Button>
                        <Button size="small" startIcon={<Close />} onClick={() => setEditingKey(null)}>Cancel</Button>
                      </Box>
                    ) : (
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {env.colorHex ? (
                              <Chip label={env.name} size="small" variant="outlined" sx={{ color: env.colorHex, borderColor: env.colorHex }} />
                            ) : (
                              <Chip label={env.name} color={env.color} size="small" />
                            )}
                            <Typography variant="body2" color="text.secondary">{env.key}</Typography>
                            {env.builtIn === 1 && (
                              <Chip label="default" size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {env.hidden === 1 ? "Hidden" : "Visible"}
                          </Typography>
                        }
                      />
                    )}
                  </ListItem>
                  {idx < allEnvironments.length - 1 && <Divider />}
                </Box>
              ))}
            </List>

            {/* Add new */}
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 180px auto", gap: 1.5, alignItems: "center" }}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
              />
              <Box sx={{ position: 'relative', width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    p: '10px 12px', border: '1px solid', borderColor: 'divider', borderRadius: 1,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                    bgcolor: 'background.paper',
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => setAddPickerAnchor(e.currentTarget)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAddPickerAnchor(e.currentTarget as HTMLElement); } }}
                >
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: colorHex, border: '1px solid', borderColor: 'divider' }} />
                  <Typography variant="body2" color="text.secondary">Change Color</Typography>
                </Box>
                {/* Color popover anchored via addPickerAnchor */}
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete environment"
        message={`Delete environment "${confirmDelete}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const { connectionRepository, environmentRepository } = await import("../repositories");
            const used = await connectionRepository.getByEnvironment(confirmDelete);
            if (used.length > 0) {
              setError(`Cannot delete: environment is used by ${used.length} connection(s)`);
              setConfirmDelete(null);
              return;
            }
            await environmentRepository.deleteByKey(confirmDelete);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to delete environment");
          } finally {
            setConfirmDelete(null);
          }
        }}
      />
      {/* Color Pickers */}
      <ColorPopover
        anchorEl={addPickerAnchor}
        color={colorHex}
        onClose={() => setAddPickerAnchor(null)}
        onSelect={(c) => { setColorHex(c); setAddPickerAnchor(null); }}
      />
      <ColorPopover
        anchorEl={editPickerAnchor}
        color={editingColorHex}
        onClose={() => setEditPickerAnchor(null)}
        onSelect={(c) => { setEditingColorHex(c); setEditPickerAnchor(null); }}
      />
    </Box>
  );
}

function ColorPopover({ anchorEl, color, onClose, onSelect }: { anchorEl: HTMLElement | null, color: string, onClose: () => void, onSelect: (c: string) => void }) {
  const open = Boolean(anchorEl);
  const PRESET_COLORS = [
    "#e53935", "#d81b60", "#8e24aa", "#5e35b1", "#3949ab",
    "#1e88e5", "#039be5", "#00acc1", "#00897b", "#43a047",
    "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00",
    "#f4511e", "#6d4c41", "#757575", "#546e7a", "#000000",
  ];
  const [local, setLocal] = React.useState<string>(color);
  React.useEffect(() => setLocal(color), [color]);
  const valid = /^#([0-9a-fA-F]{6})$/.test(local);
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 } }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 18px)', gap: 0.75 }}>
        {PRESET_COLORS.map((c) => (
          <Box key={c} onClick={() => onSelect(c)} sx={{ width: 18, height: 18, borderRadius: 0.75, bgcolor: c, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.15)' }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField size="small" label="#RRGGBB" value={local}
          onChange={(e) => setLocal(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
          sx={{ width: 140 }} />
        <Box sx={{ width: 24, height: 24, borderRadius: 0.75, bgcolor: valid ? local : '#ffffff', border: '1px solid', borderColor: 'divider' }} />
        <Button size="small" variant="contained" disabled={!valid} onClick={() => onSelect(local)}>Apply</Button>
      </Box>
    </Popover>
  );
}
