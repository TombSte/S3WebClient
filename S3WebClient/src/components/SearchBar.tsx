import { Autocomplete, TextField, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { SxProps, Theme } from "@mui/material/styles";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  sx?: SxProps<Theme>;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  suggestions = [],
  placeholder = "Cerca...",
  sx,
}: SearchBarProps) {
  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={suggestions.filter(Boolean)}
      inputValue={value}
      onInputChange={(_, newInput) => onChange(newInput)}
      onChange={(_, newValue) => onSearch(newValue ?? "")}
      sx={{
        width: "100%",
        "& .MuiOutlinedInput-root": {
          px: 1,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          },
          "&.Mui-focused": {
            borderColor: "primary.main",
            boxShadow: "0 0 0 2px rgba(25,118,210,0.2)",
          },
          "& fieldset": { border: "none" },
        },
        ...sx,
      }}
      componentsProps={{
        paper: {
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        },
        listbox: {
          sx: {
            py: 0,
            "& .MuiAutocomplete-option": {
              px: 1.5,
              py: 1,
            },
          },
        },
      }}
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
                    onClick={() => {
                      onChange("");
                      onSearch("");
                    }}
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
