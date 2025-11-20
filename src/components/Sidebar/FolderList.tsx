import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotesStore } from "@/store/useNotesStore";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "../EmojiPicker/EmojiPicker";

export const FolderList = () => {
  const { folders, deleteFolder, updateFolder, selectFolder, selectedFolderId } = useNotesStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateFolder(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleEmojiSelect = (folderId: string, emoji: string) => {
    updateFolder(folderId, { emoji });
    setShowEmojiPicker(null);
  };

  return (
    <div className="mb-4 space-y-1">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`group relative rounded-lg transition-colors ${
            selectedFolderId === folder.id
              ? "bg-sidebar-accent"
              : "hover:bg-sidebar-accent/50"
          }`}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 pr-10"
            onClick={() => selectFolder(folder.id)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(showEmojiPicker === folder.id ? null : folder.id);
              }}
              className="text-lg hover:scale-110 transition-transform"
            >
              {folder.emoji}
            </button>
            {editingId === folder.id ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleSaveEdit(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit(folder.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="h-6 px-2 py-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate">{folder.name}</span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStartEdit(folder.id, folder.name)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteFolder(folder.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {showEmojiPicker === folder.id && (
            <div className="absolute left-0 top-full mt-1 z-50">
              <EmojiPicker
                onSelect={(emoji) => handleEmojiSelect(folder.id, emoji)}
                onClose={() => setShowEmojiPicker(null)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
