import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Note, Folder, VoiceNote } from "@/types/note";

interface NotesStore {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  searchQuery: string;

  // Notes actions
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt" | "voiceNotes">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  selectNote: (id: string | null) => void;

  // Folders actions
  addFolder: (folder: Omit<Folder, "id" | "createdAt">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  selectFolder: (id: string | null) => void;

  // Voice notes actions
  addVoiceNote: (noteId: string, voiceNote: Omit<VoiceNote, "id" | "createdAt">) => void;
  deleteVoiceNote: (noteId: string, voiceNoteId: string) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Computed
  getFilteredNotes: () => Note[];
  getSelectedNote: () => Note | null;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      folders: [],
      selectedNoteId: null,
      selectedFolderId: null,
      searchQuery: "",

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          voiceNotes: [],
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          selectedNoteId: newNote.id,
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        }));
      },

      duplicateNote: (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (note) {
          const duplicated: Note = {
            ...note,
            id: crypto.randomUUID(),
            title: `${note.title} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({ notes: [duplicated, ...state.notes] }));
        }
      },

      selectNote: (id) => set({ selectedNoteId: id }),

      addFolder: (folder) => {
        const newFolder: Folder = {
          ...folder,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({ folders: [...state.folders, newFolder] }));
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        }));
      },

      deleteFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          notes: state.notes.map((note) =>
            note.folderId === id ? { ...note, folderId: null } : note
          ),
        }));
      },

      selectFolder: (id) => set({ selectedFolderId: id }),

      addVoiceNote: (noteId, voiceNote) => {
        const newVoiceNote: VoiceNote = {
          ...voiceNote,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  voiceNotes: [...note.voiceNotes, newVoiceNote],
                  updatedAt: new Date(),
                }
              : note
          ),
        }));
      },

      deleteVoiceNote: (noteId, voiceNoteId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  voiceNotes: note.voiceNotes.filter((vn) => vn.id !== voiceNoteId),
                  updatedAt: new Date(),
                }
              : note
          ),
        }));
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      getFilteredNotes: () => {
        const { notes, selectedFolderId, searchQuery } = get();
        let filtered = notes;

        if (selectedFolderId) {
          filtered = filtered.filter((note) => note.folderId === selectedFolderId);
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (note) =>
              note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      getSelectedNote: () => {
        const { notes, selectedNoteId } = get();
        return notes.find((note) => note.id === selectedNoteId) || null;
      },
    }),
    {
      name: "ayunotes-storage",
    }
  )
);
