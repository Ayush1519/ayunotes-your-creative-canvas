import { useNotesStore } from "@/store/useNotesStore";
import { Canvas } from "../Canvas/Canvas";
import { Editor } from "../Editor/Editor";
import { EmptyState } from "./EmptyState";

export const MainContent = () => {
  const { getSelectedNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  if (!selectedNote) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-6 overflow-auto">
        <div className="flex-1 min-w-0">
          <Canvas />
        </div>
        <div className="flex-1 min-w-0">
          <Editor />
        </div>
      </div>
    </div>
  );
};
