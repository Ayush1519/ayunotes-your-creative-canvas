import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Copy, Trash2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotesStore } from "@/store/useNotesStore";

export const NotesList = () => {
  const { getFilteredNotes, selectNote, selectedNoteId, deleteNote, duplicateNote } =
    useNotesStore();
  const notes = getFilteredNotes();

  return (
    <div className="space-y-1">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`group relative rounded-lg transition-all cursor-pointer ${
            selectedNoteId === note.id
              ? "bg-sidebar-accent shadow-soft"
              : "hover:bg-sidebar-accent/50"
          }`}
          onClick={() => selectNote(note.id)}
        >
          <div className="flex items-start gap-3 p-3">
            <span className="text-2xl">{note.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{note.title}</h3>
                {note.voiceNotes.length > 0 && (
                  <Mic className="h-3 w-3 text-accent" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {note.content.replace(/<[^>]*>/g, "").substring(0, 60)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => duplicateNote(note.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteNote(note.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      {notes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No notes found</p>
        </div>
      )}
    </div>
  );
};
