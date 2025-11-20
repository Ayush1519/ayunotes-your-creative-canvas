import { useEffect, useRef, useState } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import { EditorToolbar } from "./EditorToolbar";
import { VoiceRecorder } from "./VoiceRecorder";
import { EmojiPicker } from "../EmojiPicker/EmojiPicker";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { getSelectedNote, updateNote } = useNotesStore();
  const selectedNote = getSelectedNote();
  const [title, setTitle] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = selectedNote.content;
      }
    }
  }, [selectedNote?.id]);

  const handleContentChange = () => {
    if (!selectedNote || !editorRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 1 second of no typing
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(selectedNote.id, {
        content: editorRef.current?.innerHTML || "",
      });
    }, 1000);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (selectedNote) {
      updateNote(selectedNote.id, { title: newTitle });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { emoji });
    }
    setShowEmojiPicker(false);
  };

  const handleSave = () => {
    if (selectedNote && editorRef.current) {
      updateNote(selectedNote.id, {
        content: editorRef.current.innerHTML,
      });
      toast.success("Note saved");
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  if (!selectedNote) return null;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-medium border border-border overflow-hidden">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl hover:scale-110 transition-transform"
            >
              {selectedNote.emoji}
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 top-full mt-2 z-50">
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-bold border-0 shadow-none focus-visible:ring-0 px-2"
            placeholder="Note title..."
          />
        </div>
        <EditorToolbar onFormat={formatText} onSave={handleSave} />
        <VoiceRecorder noteId={selectedNote.id} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="flex-1 p-6 overflow-auto focus:outline-none prose prose-sm max-w-none"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
};
