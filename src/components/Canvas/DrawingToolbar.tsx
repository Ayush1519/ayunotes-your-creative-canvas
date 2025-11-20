import { Pen, Eraser, Trash2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DrawingTool } from "@/types/note";

interface DrawingToolbarProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClear: () => void;
  onExport: () => void;
  onInsert: () => void;
}

export const DrawingToolbar = ({
  tool,
  onToolChange,
  onClear,
  onExport,
  onInsert,
}: DrawingToolbarProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 border-b border-border">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={tool.type === "pen" ? "default" : "outline"}
          onClick={() => onToolChange({ ...tool, type: "pen" })}
          className="h-9"
        >
          <Pen className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={tool.type === "eraser" ? "default" : "outline"}
          onClick={() => onToolChange({ ...tool, type: "eraser" })}
          className="h-9"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={tool.color}
          onChange={(e) => onToolChange({ ...tool, color: e.target.value })}
          className="h-9 w-12 rounded border border-border cursor-pointer"
          disabled={tool.type === "eraser"}
        />
        <div className="w-24">
          <Slider
            value={[tool.size]}
            onValueChange={([size]) => onToolChange({ ...tool, size })}
            min={1}
            max={20}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onInsert}>
          <FileText className="mr-2 h-4 w-4" />
          Insert
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm" variant="outline" onClick={onClear}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
