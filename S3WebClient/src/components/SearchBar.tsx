import { Autocomplete, TextField, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { SxProps, Theme } from "@mui/material/styles";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  sx?: SxProps<Theme>;
}

export default function SearchBar({
  value,
  onChange,
  suggestions = [],
  placeholder = "Cerca...",
  sx,
}: SearchBarProps) {
  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={suggestions}
      inputValue={value}
      onInputChange={(_, newInput) => onChange(newInput)}
      sx={{ width: "100%", ...sx }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {value && (
                  <IconButton
                    size="small"
                    onClick={() => onChange("")}
                    sx={{ mr: -1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
