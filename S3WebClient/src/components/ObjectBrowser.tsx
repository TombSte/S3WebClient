import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import type { S3Connection, S3ObjectEntity } from "../types/s3";
import { objectRepository, s3ObjectRepository } from "../repositories";
import ObjectTreeView from "./ObjectTreeView";
import ObjectFlatList from "./ObjectFlatList";
import SearchBar from "./SearchBar";
import ObjectPropertiesDrawer from "./ObjectPropertiesDrawer";
import RenameObjectDialog from "./RenameObjectDialog";

interface Props {
  connection: S3Connection;
}

export interface ObjectBrowserHandle {
  refresh: () => Promise<void>;
  getSelectedPrefix: () => string;
}

const ObjectBrowser = forwardRef<ObjectBrowserHandle, Props>(
  ({ connection }, ref) => {
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rootItems, setRootItems] = useState<S3ObjectEntity[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<S3ObjectEntity[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [propItem, setPropItem] = useState<S3ObjectEntity | null>(null);
  const [renameItem, setRenameItem] = useState<S3ObjectEntity | null>(null);
  const [selectedPrefix, setSelectedPrefix] = useState("");

  const fetchChildrenFromS3 = useCallback(
    async (prefix: string) => {
      const all = await s3ObjectRepository.list(connection, prefix);
      await objectRepository.save(all);
      return all;
    },
    [connection]
  );

  const loadChildren = useCallback(
    async (prefix: string) => {
      const cached = await objectRepository.getChildren(connection.id, prefix);
      if (cached.length > 0) return cached;
      return await fetchChildrenFromS3(prefix);
    },
    [connection.id, fetchChildrenFromS3]
  );

  useEffect(() => {
    (async () => {
      const children = await loadChildren("");
      setRootItems(children);
    })();
  }, [loadChildren, refreshTick]);

  useEffect(() => {
    (async () => {
      if (searchInput.trim() === "") {
        setSuggestions([]);
        return;
      }
      const results = await objectRepository.search(
        connection.id,
        searchInput.trim()
      );
      const names = results.map((r) => {
        const parts = r.key.split("/");
        return parts[parts.length - 1] || r.key;
      });
      setSuggestions(Array.from(new Set(names)).slice(0, 5));
    })();
  }, [searchInput, connection.id, refreshTick]);

  useEffect(() => {
    if (searchInput.trim() === "" && query) {
      setQuery("");
      setSearchResults([]);
    }
  }, [searchInput, query]);

  const handleSearch = async (term: string) => {
    const q = term.trim();
    setQuery(q);
    if (q === "") {
      setSearchResults([]);
      return;
    }
    const results = await objectRepository.search(connection.id, q);
    setSearchResults(results);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const all = await s3ObjectRepository.listAll(connection);
      await objectRepository.replaceAll(connection.id, all);
      setRefreshTick((t) => t + 1);
    } catch (err) {
      console.error("Error refreshing objects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: S3ObjectEntity) => {
    try {
      const body = await s3ObjectRepository.download(connection, item.key);
      if (!body) return;
      const blob = new Blob([body]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.key.split("/").pop() || item.key;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleRename = (item: S3ObjectEntity) => {
    if (item.isFolder === 1) return;
    setRenameItem(item);
  };

  const confirmRename = async (newName: string) => {
    if (!renameItem) return;
    const currentName = renameItem.key.split("/").pop() || renameItem.key;
    if (newName === currentName) {
      setRenameItem(null);
      return;
    }
    const newKey = `${renameItem.parent}${newName}`;
    try {
      await s3ObjectRepository.rename(connection, renameItem.key, newKey);
      await handleRefresh();
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setRenameItem(null);
    }
  };

  const handleProperties = (item: S3ObjectEntity) => {
    setPropItem(item);
  };

  useImperativeHandle(ref, () => ({
    refresh: handleRefresh,
    getSelectedPrefix: () => selectedPrefix,
  }));

  return (
    <div>
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSearch={handleSearch}
        suggestions={suggestions}
        placeholder="Cerca..."
        sx={{ mb: 2 }}
      />
      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : query ? (
        searchResults.length > 0 ? (
          <ObjectFlatList
            items={searchResults}
            onDownload={handleDownload}
            onRename={handleRename}
            onProperties={handleProperties}
          />
        ) : (
          <Typography>Nessun oggetto corrisponde alla ricerca</Typography>
        )
      ) : rootItems.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <InboxIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1 }} />
          <Typography>
            Questo bucket è vuoto. Carica qualche file per iniziare!
          </Typography>
        </Box>
      ) : (
        <ObjectTreeView
          key={refreshTick}
          rootItems={rootItems}
          loadChildren={loadChildren}
          onDownload={handleDownload}
          onRename={handleRename}
          onProperties={handleProperties}
          selected={selectedPrefix}
          onSelect={(p) => setSelectedPrefix(p)}
        />
      )}
      <ObjectPropertiesDrawer
        item={propItem}
        onClose={() => setPropItem(null)}
      />
      <RenameObjectDialog
        open={!!renameItem}
        currentName={renameItem?.key.split("/").pop() || ""}
        onCancel={() => setRenameItem(null)}
        onConfirm={confirmRename}
      />
    </div>
  );
});

export default ObjectBrowser;
