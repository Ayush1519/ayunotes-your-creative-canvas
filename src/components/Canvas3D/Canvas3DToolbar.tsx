import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Undo2, Redo2, Trash2, Save, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Canvas3DToolbarProps {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushThickness: number;
  setBrushThickness: (size: number) => void;
  glowMode: boolean;
  setGlowMode: (glow: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PRESET_COLORS = [
  "#ff6b9d", // pink
  "#c084fc", // purple
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#f87171", // red
  "#fb923c", // orange
  "#e879f9", // magenta
];

export const Canvas3DToolbar = ({
  brushColor,
  setBrushColor,
  brushThickness,
  setBrushThickness,
  glowMode,
  setGlowMode,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo,
  canRedo,
}: Canvas3DToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-card/95 backdrop-blur-sm shadow-elegant border border-border max-w-xs">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button
          onClick={onSave}
          variant="default"
          size="sm"
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Brush Color</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setBrushColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                brushColor === color ? "border-primary ring-2 ring-primary/50" : "border-border"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>

      {/* Brush Thickness */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Brush Size: {brushThickness.toFixed(2)}
        </Label>
        <Slider
          value={[brushThickness]}
          onValueChange={([value]) => setBrushThickness(value)}
          min={0.05}
          max={0.5}
          step={0.05}
          className="w-full"
        />
      </div>

      {/* Glow Mode Toggle */}
      <Button
        onClick={() => setGlowMode(!glowMode)}
        variant={glowMode ? "default" : "outline"}
        size="sm"
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {glowMode ? "Glow On" : "Glow Off"}
      </Button>
    </div>
  );
};
