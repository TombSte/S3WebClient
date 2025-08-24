import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import type { UserProfile } from "../types/profile";

interface EditProfileDialogProps {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

export default function EditProfileDialog({ open, profile, onClose, onSave }: EditProfileDialogProps) {
  const [form, setForm] = useState({ ...profile, skillsText: profile.skills.join(", ") });

  useEffect(() => {
    setForm({ ...profile, skillsText: profile.skills.join(", ") });
  }, [profile]);

  const handleSave = () => {
    onSave({
      name: form.name,
      email: form.email,
      role: form.role,
      company: form.company,
      location: form.location,
      joinDate: form.joinDate,
      bio: form.bio,
      skills: form.skillsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Modifica Profilo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Ruolo" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <TextField
            label="Azienda"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <TextField
            label="Località"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <TextField
            label="Membro dal"
            value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
          />
          <TextField
            label="Biografia"
            multiline
            minRows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <TextField
            label="Competenze (separate da virgola)"
            value={form.skillsText}
            onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">Salva</Button>
      </DialogActions>
    </Dialog>
  );
}
