import { StickyNote } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-pastel">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-medium">
            <StickyNote className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Welcome to AyuNotes</h2>
        <p className="text-muted-foreground max-w-md">
          Create a new note to start writing, drawing, and recording your thoughts.
        </p>
      </div>
    </div>
  );
};
