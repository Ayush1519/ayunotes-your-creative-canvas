import { StickyNote } from "lucide-react";

export const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-medium">
          <StickyNote className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AyuNotes
        </h1>
      </div>
    </header>
  );
};
