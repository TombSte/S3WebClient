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
import { objectRepository, objectService } from "../repositories";
import ObjectTreeView from "./ObjectTreeView";
import ObjectFlatList from "./ObjectFlatList";
import SearchBar from "./SearchBar";
import ObjectPropertiesDrawer from "./ObjectPropertiesDrawer";
import RenameObjectDialog from "./RenameObjectDialog";
import DuplicateObjectDialog from "./DuplicateObjectDialog";
import ShareObjectDialog from "./ShareObjectDialog";
import MoveObjectDialog from "./MoveObjectDialog";
import { shareRepository } from "../repositories";

interface Props {
  connection: S3Connection;
  disableActions?: boolean;
}

export interface ObjectBrowserHandle {
  refresh: () => Promise<void>;
  getSelectedPrefix: () => string;
}

const ObjectBrowser = forwardRef<ObjectBrowserHandle, Props>(
  ({ connection, disableActions = false }, ref) => {
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rootItems, setRootItems] = useState<S3ObjectEntity[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<S3ObjectEntity[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [propItem, setPropItem] = useState<S3ObjectEntity | null>(null);
  const [renameItem, setRenameItem] = useState<S3ObjectEntity | null>(null);
  const [duplicateItem, setDuplicateItem] = useState<S3ObjectEntity | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [shareItem, setShareItem] = useState<S3ObjectEntity | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const [moveItem, setMoveItem] = useState<S3ObjectEntity | null>(null);

  const fetchChildren = useCallback(
    async (prefix: string) => {
      try {
        return await objectService.fetchChildren(connection, prefix);
      } catch {
        alert("Errore nel recupero degli oggetti");
        return [];
      }
    },
    [connection]
  );

  const loadChildren = useCallback(
    async (prefix: string) => {
      const cached = await objectRepository.getChildren(connection.id, prefix);
      if (cached.length > 0) return cached;
      return await fetchChildren(prefix);
    },
    [connection.id, fetchChildren]
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
      await objectService.refreshAll(connection);
      setRefreshTick((t) => t + 1);
    } catch {
      alert("Errore durante l'aggiornamento degli oggetti");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: S3ObjectEntity) => {
    try {
      const body = await objectService.download(connection, item.key);
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
    } catch {
      alert("Errore durante il download");
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
      await objectService.rename(connection, renameItem.key, newKey);
      setRefreshTick((t) => t + 1);
    } catch {
      alert("Errore durante la rinomina");
    } finally {
      setRenameItem(null);
    }
  };

  const handleDuplicate = (item: S3ObjectEntity) => {
    if (item.isFolder === 1) return;
    const base = item.key.split("/").pop() || item.key;
    const newName = base.replace(/(\.[^.]*)?$/, (ext) => `-copia${ext}`);
    setDuplicateItem(item);
    setDuplicateName(newName);
  };

  const confirmDuplicate = async (newName: string) => {
    if (!duplicateItem) return;
    const newKey = `${duplicateItem.parent}${newName}`;
    try {
      await objectService.duplicate(connection, duplicateItem.key, newKey);
      setRefreshTick((t) => t + 1);
    } catch {
      alert("Errore durante la duplicazione");
    } finally {
      setDuplicateItem(null);
      setDuplicateName("");
    }
  };

  const handleShare = (item: S3ObjectEntity) => {
    if (item.isFolder === 1) return;
    setShareItem(item);
    setShareUrl("");
  };

  const handleDelete = async (item: S3ObjectEntity) => {
    if (item.isFolder === 1) return;
    if (!confirm(`Eliminare definitivamente ${item.key}?`)) return;
    try {
      await objectService.delete(connection, item.key);
      setRefreshTick((t) => t + 1);
    } catch {
      alert("Errore durante l'eliminazione");
    }
  };

  const handleMove = (item: S3ObjectEntity) => {
    if (item.isFolder === 1) return;
    setMoveItem(item);
  };

  const confirmShare = async (expires: Date) => {
    if (!shareItem) return;
    try {
      const url = await objectService.share(connection, shareItem.key, expires);
      await shareRepository.add({
        connectionId: connection.id,
        key: shareItem.key,
        url,
        expires,
      });
      setShareUrl(url);
    } catch {
      alert("Errore durante la condivisione");
      setShareItem(null);
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
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSearch={handleSearch}
        suggestions={suggestions}
        placeholder="Cerca..."
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {loading ? (
          <Typography>Caricamento...</Typography>
        ) : query ? (
          searchResults.length > 0 ? (
            <ObjectFlatList
              items={searchResults}
              onDownload={disableActions ? undefined : handleDownload}
              onRename={disableActions ? undefined : handleRename}
              onDuplicate={disableActions ? undefined : handleDuplicate}
              onShare={disableActions ? undefined : handleShare}
              onProperties={disableActions ? undefined : handleProperties}
              onDelete={disableActions ? undefined : handleDelete}
              onMove={disableActions ? undefined : handleMove}
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
            onDownload={disableActions ? undefined : handleDownload}
            onRename={disableActions ? undefined : handleRename}
            onDuplicate={disableActions ? undefined : handleDuplicate}
            onShare={disableActions ? undefined : handleShare}
            onProperties={disableActions ? undefined : handleProperties}
            onDelete={disableActions ? undefined : handleDelete}
            onMove={disableActions ? undefined : handleMove}
            selected={selectedPrefix}
            onSelect={(p) => setSelectedPrefix(p)}
          />
        )}
      </Box>
      <ObjectPropertiesDrawer
        connectionId={connection.id}
        item={propItem}
        onClose={() => setPropItem(null)}
      />
      <RenameObjectDialog
        open={!!renameItem}
        currentName={renameItem?.key.split("/").pop() || ""}
        onCancel={() => setRenameItem(null)}
        onConfirm={confirmRename}
      />
      <DuplicateObjectDialog
        open={!!duplicateItem}
        currentName={duplicateName}
        onCancel={() => setDuplicateItem(null)}
        onConfirm={confirmDuplicate}
      />
      <ShareObjectDialog
        open={!!shareItem}
        url={shareUrl}
        onCancel={() => {
          setShareItem(null);
          setShareUrl("");
        }}
        onGenerate={confirmShare}
      />
      <MoveObjectDialog
        open={!!moveItem}
        connection={connection}
        sourceKey={moveItem?.key || ""}
        onClose={() => setMoveItem(null)}
        onMoved={async () => {
          setRefreshTick((t) => t + 1);
        }}
      />
    </Box>
  );
});

export default ObjectBrowser;
