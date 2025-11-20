import { useState } from "react";
import { Search, Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotesStore } from "@/store/useNotesStore";
import { FolderList } from "./FolderList";
import { NotesList } from "./NotesList";
import { EmojiPicker } from "../EmojiPicker/EmojiPicker";

export const Sidebar = () => {
  const { addNote, addFolder, searchQuery, setSearchQuery, selectFolder } = useNotesStore();
  const [showFolderEmojiPicker, setShowFolderEmojiPicker] = useState(false);

  const handleNewNote = () => {
    addNote({
      title: "Untitled Note",
      content: "",
      emoji: "📝",
      folderId: null,
      drawing: undefined,
    });
  };

  const handleNewFolder = (emoji: string) => {
    addFolder({
      name: "New Folder",
      emoji,
    });
    setShowFolderEmojiPicker(false);
  };

  return (
    <aside className="flex w-80 flex-col border-r border-border bg-sidebar shadow-soft">
      <div className="flex flex-col gap-3 p-4 border-b border-sidebar-border">
        <div className="flex gap-2">
          <Button
            onClick={handleNewNote}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
          <div className="relative">
            <Button
              onClick={() => setShowFolderEmojiPicker(!showFolderEmojiPicker)}
              variant="outline"
              size="icon"
              className="shadow-soft"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
            {showFolderEmojiPicker && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <EmojiPicker
                  onSelect={handleNewFolder}
                  onClose={() => setShowFolderEmojiPicker(false)}
                />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 shadow-soft"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start mb-2 hover:bg-sidebar-accent"
            onClick={() => selectFolder(null)}
          >
            📚 All Notes
          </Button>
          <FolderList />
          <NotesList />
        </div>
      </ScrollArea>
    </aside>
  );
};
